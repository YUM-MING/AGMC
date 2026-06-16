import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const imageApiKey = import.meta.env.VITE_IMAGE_OPENAI_API_KEY || apiKey;

const openai = apiKey ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) : null;
const imageOpenai = imageApiKey ? new OpenAI({ apiKey: imageApiKey, dangerouslyAllowBrowser: true }) : null;

export const GENRE_TEMPLATES = {
  minesweeper: {
    name: "지뢰찾기",
    description: "그리드 클릭, 지뢰 배치 및 승패 판정 로직",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  create() {
    this.add.text(400, 300, '지뢰찾기 기초 구조 준비됨', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
  }
}`
  },
  rpg: {
    name: "탑다운 RPG",
    description: "이동 및 충돌 기초",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  preload() { this.load.image('player', 'https://labs.phaser.io/assets/sprites/ghost.png'); }
  create() {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);
    if (this.cursors.up.isDown) this.player.setVelocityY(-160);
    else if (this.cursors.down.isDown) this.player.setVelocityY(160);
  }
}`
  }
};

const DEPT_SYSTEM_PROMPTS = {
  strategy: "당신은 AGMC의 '전략기획실장'입니다. 게임의 핵심 컨셉과 장르를 기획합니다.",
  content: "당신은 AGMC의 '콘텐츠개발 디렉터'입니다. 시나리오와 에셋 묘사를 담당합니다. [캐릭터], [배경], [아이템] 카테고리를 엄격히 구분하세요.",
  engineering: "당신은 AGMC의 '기술구현 리드 개발자'입니다. Phaser.js 전문가입니다. **반드시 공유된 에셋 목록에 있는 ID만 사용하세요. 없는 이미지를 지어내서 로드하면 절대 안 됩니다.**",
  ops: "당신은 AGMC의 '라이브운영 팀장'입니다. 밸런싱과 개선 조율을 담당합니다.",
  analytics: "당신은 AGMC의 '데이터 인사이트 전문가'입니다. 프로젝트 현황 분석과 재미 요소를 진단합니다."
};

export const requestAiTask = async (deptId, instruction, fullState = {}) => {
  if (!openai) throw new Error("API 키 미설정");

  const { projectName, projectData, generatedAssets } = fullState;
  const systemPromptBase = DEPT_SYSTEM_PROMPTS[deptId];

  // 에셋 컨텍스트 구성
  const assetsInfo = generatedAssets?.length > 0 
    ? generatedAssets.map(a => `- ID: "${a.id}", 설명: ${a.description}`).join('\n')
    : "생성된 에셋 없음";

  const projectContext = `
### [공유 지식: 프로젝트 ${projectName || '무제'}] ###
1. 전략기획: ${projectData?.strategy || '미정'}
2. 콘텐츠: ${projectData?.content || '미정'}
3. 기술구현: ${projectData?.engineering ? '코드 작성됨' : '미정'}
4. 라이브운영: ${projectData?.ops || '미정'}
5. 데이터분석: ${projectData?.analytics || '미정'}

### [사용 가능한 실제 이미지 에셋 목록] ###
${assetsInfo}
**주의: 이 목록에 없는 ID는 절대로 사용하지 마세요.**
`;

  const finalSystemPrompt = `${systemPromptBase}\n\n당신은 다른 부서의 모든 진행 상황을 알고 있는 팀원입니다. 정보를 무시하지 마세요.\n\n${projectContext}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: instruction }
      ],
      temperature: 0.3
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI 요청 오류:", error);
    throw error;
  }
};

export const requestImageGeneration = async (prompt, numImages = 1, category = "캐릭터") => {
  let categoryRule = "";
  if (category === "배경") {
    categoryRule = "배경 아트입니다. 사람, 얼굴, 캐릭터, 생물체가 절대로 없어야 합니다. 오직 풍경이나 사물만 그리세요.";
  } else if (category === "아이템" || category === "오브젝트") {
    categoryRule = "단일 아이템입니다. 사람의 손이나 캐릭터가 포함되지 않아야 합니다.";
  } else {
    categoryRule = "캐릭터 아트입니다.";
  }

  const finalPrompt = `2D 도트 스타일, 흰색 배경. [카테고리 규칙: ${categoryRule}] [요청: ${prompt}] 절대 사람을 그리지 마세요(배경/아이템일 때).`;

  if (!imageOpenai) return [];

  try {
    const response = await imageOpenai.images.generate({
      model: "gpt-image-2",
      prompt: finalPrompt,
      n: numImages
    });
    const results = [];
    for (const item of response.data) {
      const b64 = item.b64_json || (item.url ? await fetchAndConvertToBase64(item.url) : null);
      if (b64) results.push(await removeWhiteBackground(b64));
    }
    return results;
  } catch (e) {
    console.warn("이미지 생성 실패", e);
    return [];
  }
};

const removeWhiteBackground = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] >= 240 && data[i + 1] >= 240 && data[i + 2] >= 240) data[i + 3] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = `data:image/png;base64,${base64Image}`;
  });
};

const fetchAndConvertToBase64 = async (url) => {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
};
