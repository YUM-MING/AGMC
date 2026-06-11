import OpenAI from 'openai';

// Vite 환경 변수에서 OpenAI API 키를 가져옵니다. 
// (.env 파일에 VITE_OPENAI_API_KEY=sk-... 형태로 넣어두시면 됩니다)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // 백엔드 없이 프론트에서 직접 호출할 때 필수 옵션
}) : null;

// 공통 게임 템플릿 (기술구현 AI에게 참고용으로 전달하거나 UI에서 제안)
export const GENRE_TEMPLATES = {
  rpg: {
    name: "탑다운 RPG 기초",
    description: "캐릭터 이동 및 타일맵 상호작용의 기본 구조",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  preload() { 
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/ghost.png');
  }
  create() {
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.add.text(16, 16, 'RPG Template: Use Arrows to Move', { fontSize: '18px', fill: '#fff' });
  }
  update() {
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);
    if (this.cursors.up.isDown) this.player.setVelocityY(-160);
    else if (this.cursors.down.isDown) this.player.setVelocityY(160);
  }
}`
  },
  clicker: {
    name: "방치형/클리커",
    description: "점수 획득 및 업그레이드 로직",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); this.score = 0; }
  create() {
    this.scoreText = this.add.text(400, 200, 'Score: 0', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    const btn = this.add.circle(400, 400, 80, 0xff0000).setInteractive();
    btn.on('pointerdown', () => {
      this.score += 1;
      this.scoreText.setText('Score: ' + this.score);
      this.tweens.add({ targets: btn, scale: 1.2, duration: 100, yoyo: true });
    });
    this.add.text(400, 500, 'Click the Red Circle!', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
  }
}`
  },
  minesweeper: {
    name: "지뢰찾기 기초",
    description: "그리드 기반의 논리 퍼즐 구조",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  create() {
    const size = 8;
    const tileSize = 50;
    const offset = 100;
    this.grid = [];
    for(let y=0; y<size; y++) {
      for(let x=0; y<size; x++) { 
        const cell = this.add.rectangle(offset + x*tileSize, offset + y*tileSize, 45, 45, 0x666666).setInteractive();
        cell.on('pointerdown', () => cell.setFillStyle(0x999999));
      }
    }
    this.add.text(16, 16, 'Minesweeper Grid Base', { fontSize: '18px', fill: '#fff' });
  }
}`
  },
  platformer: {
    name: "횡스크롤 플랫폼",
    description: "중력 적용 및 점프 구현",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  preload() {
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('dude', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
  }
  create() {
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);
    else this.player.setVelocityX(0);

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}`
  }
};

// 회장님이 주신 "부서별 맞춤형 페르소나" 프롬프트 시스템
const DEPT_SYSTEM_PROMPTS = {
  strategy: 
    "당신은 AGMC의 '전략기획 AI'입니다. 게임의 핵심 컨셉, 장르, 타겟 유저, 메인 루프를 기획합니다. 수익 모델(BM)은 배제하고 순수하게 '재미'와 '게임성'에 집중하세요. 최대한 구체적이고 깊이 있는 기획을 한국어로 제공하세요.",
  content: 
    "당신은 AGMC의 '콘텐츠개발 AI'입니다. 게임의 세계관, 시나리오, 캐릭터 설정을 담당합니다. 특히 게임의 비주얼 스타일을 구체적으로 묘사하고, 기술구현부가 코드로 완벽히 구현할 수 있도록 매우 상세한 에셋 설명(색상, 형태, 애니메이션 느낌 등)을 포함하세요. 풍부한 창의성을 발휘하여 한국어로 답변하세요.",
  engineering: 
    "당신은 AGMC의 '기술구현 AI'입니다. Phaser.js(v3) 전문가입니다.\n" +
    "지시사항과 다른 부서의 기획 내용을 바탕으로 **반드시 class MainScene extends Phaser.Scene** 형태의 Javascript 클래스 코드를 작성하여 게임을 최대한 높은 퀄리티로 완벽하게 구현하세요.\n\n" +
    "[규칙]\n" +
    "1. 코드 블록 ```javascript ... ``` 안에 클래스 전체를 포함하세요.\n" +
    "2. 'export', 'import' 키워드는 절대 사용하지 마세요. (브라우저 스크립트 삽입 방식임)\n" +
    "3. 'window.onload'나 'new Phaser.Game' 같은 베이스 설정 코드는 작성하지 마세요. 오직 'class MainScene' 정의만 필요합니다.\n" +
    "4. 이미지는 'assets/...' 경로를 사용하거나 외부 URL을 사용하세요.\n" +
    "5. 주석은 한국어로 상세하게 작성하여 로직을 설명하세요.\n" +
    "6. 복잡한 로직이 필요하다면 망설이지 말고 전체 코드를 길고 완벽하게 작성하세요.",
  ops: 
    "당신은 AGMC의 '라이브운영 AI'입니다. 프로토타입의 난이도 밸런스, 레벨 디자인, 유저 피드백 시뮬레이션을 담당합니다. 수익 모델 관련 운영은 배제하고, 유저가 더 오래 즐겁게 플레이할 수 있는 구체적이고 전문적인 개선안을 한국어로 제안하세요.",
  analytics: 
    "당신은 AGMC의 '데이터인사이트 AI'입니다. 게임의 재미 요소 분석, 난이도 곡선 시각화, 플레이 테스트 보고서를 담당합니다. 지표를 통해 게임의 완성도를 높이는 깊이 있는 통찰을 한국어로 제공하세요."
};

/**
 * 회장님의 업무 지시를 각 AI 부서원에게 전달하는 핵심 함수
 * @param {string} deptId - 부서 ID (strategy, content, engineering 등)
 * @param {string} instruction - 회장님의 자연어 명령
 * @param {object} fullState - 현재 프로젝트의 전체 상태 (projectName, projectData)
 */
export const requestAiTask = async (deptId, instruction, fullState = {}) => {
  if (!openai) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.");
  }

  const { projectName, projectData } = fullState;
  const systemPromptBase = DEPT_SYSTEM_PROMPTS[deptId];
  
  if (!systemPromptBase) {
    throw new Error("존재하지 않는 부서입니다.");
  }

  // 토큰 제한 해제: 각 부서의 데이터를 요약 없이 원본 그대로 전달하여 퀄리티 극대화
  const getFullData = (text) => text ? text : 'Not defined yet';

  const projectContext = `
    [CURRENT PROJECT: ${projectName || 'Unnamed Project'}]
    
    --- 전략기획부 데이터 ---
    ${getFullData(projectData?.strategy)}
    
    --- 콘텐츠개발부 데이터 ---
    ${getFullData(projectData?.content)}
    
    --- 기술구현부 데이터 ---
    ${getFullData(projectData?.engineering)}
    
    --- 라이브운영부 데이터 ---
    ${getFullData(projectData?.ops)}
    
    --- 데이터인사이트부 데이터 ---
    ${getFullData(projectData?.analytics)}
  `;

  // 기술구현부일 경우 템플릿 정보 추가 전달
  let templateGuide = "";
  if (deptId === 'engineering') {
    templateGuide = "\n[참고 가능한 기초 구조 (Templates)]: " + JSON.stringify(GENRE_TEMPLATES);
  }

  const finalSystemPrompt = `
    ${systemPromptBase}
    ${templateGuide}
    
    You are working on a SHARED project within AGMC. 
    Here is the comprehensive context of what ALL other departments have done so far. Use this information fully to maximize the quality of your output:
    ${projectContext}

    IMPORTANT: Your response MUST be highly consistent with the work of other departments. 
    Focus ONLY on your specific role. Do not repeat the context.
    
    CRITICAL INSTRUCTION: ALL OUTPUT MUST BE IN KOREAN (한국어). Do not use English unless it is for code snippets or specific technical terms.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: instruction }
      ],
      temperature: 0.5,
      max_tokens: 4096 // 퀄리티 보장을 위해 토큰 제한을 넉넉하게 설정
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("GPT-4o 통신 오류:", error);
    throw error;
  }
};

/**
 * 프론트엔드 캔버스를 이용해 생성된 이미지의 흰색 배경을 투명하게(누끼 따기) 처리하는 헬퍼 함수
 */
const removeWhiteBackground = (base64Image) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const tolerance = 240; 

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] >= tolerance && data[i + 1] >= tolerance && data[i + 2] >= tolerance) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64Image}`;
  });
};

/**
 * DALL-E 3를 사용하여 게임 에셋 이미지를 생성하는 함수
 */
export const requestImageGeneration = async (prompt, count = 1) => {
  if (!openai) {
    throw new Error("OpenAI API 키가 설정되지 않았습니다.");
  }

  const basePrompt = `사용자가 요청한 정보를 클래식 온라인 게임 캐릭터 및 사물로 재해석하세요. 도트 그래픽 기반의 치비(Chibi) 아바타 스타일이며, 옛날 한국 MMORPG 캐릭터 선택창에 나올 법한 느낌입니다.
요청된 대상의 특징을 유지하되, 이를 단순화된 도트 디자인으로 표현하세요.
배경은 완벽한 흰색(Pure white background)이어야 쉽게 누끼를 딸 수 있습니다. 전신(Full body), 정면(Front view) 구도.

[사용자 요청 사항]: ${prompt}

[금지 사항]: 실사, 애니메이션 일러스트, 3D 렌더링, 복잡한 배경, 텍스트.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: basePrompt.substring(0, 4000),
      size: "1024x1024",
      quality: "hd", // 이미지 품질을 최고 수준으로 상향
      n: count
    });

    const results = [];
    for (const item of response.data) {
      const b64 = item.b64_json || (item.url ? await fetchAndConvertToBase64(item.url) : null);
      if (b64) {
        const transparent = await removeWhiteBackground(b64);
        results.push(transparent);
      }
    }
    return results;
  } catch (error) {
    console.error("이미지 생성 오류:", error);
    throw error;
  }
};

const fetchAndConvertToBase64 = async (url) => {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(blob);
  });
};
