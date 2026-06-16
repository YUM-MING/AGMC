import OpenAI from 'openai';

// Vite 환경 변수에서 OpenAI API 키를 가져옵니다. 
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const imageApiKey = import.meta.env.VITE_IMAGE_OPENAI_API_KEY || apiKey;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true 
}) : null;

const imageOpenai = imageApiKey ? new OpenAI({
  apiKey: imageApiKey,
  dangerouslyAllowBrowser: true
}) : null;

export const GENRE_TEMPLATES = {
  minesweeper: {
    name: "지뢰찾기",
    description: "그리드 클릭, 지뢰 배치 및 승패 판정 로직이 포함된 기본 지뢰찾기",
    code: `class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 250, 'Minesweeper', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 350, 'Click to Start', { fontSize: '24px', fill: '#aaa' }).setOrigin(0.5);
    this.input.on('pointerdown', () => this.scene.start('MainScene'));
  }
}

class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  create() {
    this.size = 8;
    this.tileSize = 50;
    this.offset = 100;
    this.mines = 10;
    this.grid = [];
    this.gameOver = false;
    this.statusText = this.add.text(400, 30, 'Minesweeper: Find the safe tiles!', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    const minePositions = new Set();
    while(minePositions.size < this.mines) minePositions.add(Math.floor(Math.random() * 64));
    for(let y=0; y<this.size; y++) {
      for(let x=0; x<this.size; x++) { 
        const isMine = minePositions.has(y * this.size + x);
        const cell = this.add.rectangle(this.offset + x * this.tileSize, this.offset + y * this.tileSize, 45, 45, 0x444444).setInteractive();
        const text = this.add.text(this.offset + x * this.tileSize, this.offset + y * this.tileSize, '', { fontSize: '20px', fill: '#000' }).setOrigin(0.5);
        cell.on('pointerdown', () => {
          if(this.gameOver || cell.fillColor !== 0x444444) return;
          if(isMine) {
            cell.setFillStyle(0xff0000); text.setText('💣');
            this.statusText.setText('Game Over!'); this.gameOver = true;
          } else {
            cell.setFillStyle(0x999999); text.setText('✓');
          }
        });
      }
    }
  }
}`
  },
  rpg: {
    name: "탑다운 RPG",
    description: "상하좌우 이동, 벽 충돌, 간단한 NPC 상호작용",
    code: `class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 250, 'RPG Adventure', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 350, 'Click to Start', { fontSize: '24px', fill: '#aaa' }).setOrigin(0.5);
    this.input.on('pointerdown', () => this.scene.start('MainScene'));
  }
}

class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  preload() { 
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/ghost.png');
  }
  create() {
    this.add.text(400, 30, 'Arrow keys to move!', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-200);
    else if (this.cursors.right.isDown) this.player.setVelocityX(200);
    if (this.cursors.up.isDown) this.player.setVelocityY(-200);
    else if (this.cursors.down.isDown) this.player.setVelocityY(200);
  }
}`
  },
  clicker: {
    name: "방치형/클리커",
    description: "버튼 터치 및 자동 생산 로직",
    code: `class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 250, 'Clicker Game', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 350, 'Click to Start', { fontSize: '24px', fill: '#aaa' }).setOrigin(0.5);
    this.input.on('pointerdown', () => this.scene.start('MainScene'));
  }
}

class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); this.gold = 0; }
  create() {
    this.goldText = this.add.text(400, 200, 'Gold: 0', { fontSize: '48px', fill: '#ffd700' }).setOrigin(0.5);
    const btn = this.add.circle(400, 400, 80, 0x4cd137).setInteractive();
    this.add.text(400, 400, 'CLICK!', { color: '#000', fontWeight: 'bold' }).setOrigin(0.5);
    btn.on('pointerdown', () => {
      this.gold++;
      this.goldText.setText('Gold: ' + this.gold);
      this.tweens.add({ targets: btn, scale: 0.9, duration: 50, yoyo: true });
    });
  }
}`
  },
  adventure: {
    name: "스토리 어드벤처",
    description: "배경, 캐릭터 배치, 상호작용 가능한 아이템, 그리고 하단 대화창 시스템",
    code: `class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 250, 'Story Adventure', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 350, 'Click to Start', { fontSize: '24px', fill: '#aaa' }).setOrigin(0.5);
    this.input.on('pointerdown', () => this.scene.start('MainScene'));
  }
}

class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  preload() {
    // 여기에 에셋 로드 (예: this.load.image('bg', window.AGMC_ASSETS['id']);)
  }
  create() {
    // 1. 배경 설정 (전체 화면)
    // const bg = this.add.image(400, 300, 'bg');
    // bg.setDisplaySize(800, 600);
    
    // 임시 배경
    this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

    // 2. 캐릭터 설정 및 크기 조정
    // const char = this.add.image(400, 350, 'character');
    // char.setScale(0.5);
    
    // 임시 캐릭터
    this.add.rectangle(400, 350, 100, 200, 0xe74c3c);

    // 3. 상호작용 가능한 아이템 배치
    // const item = this.add.image(600, 450, 'item').setInteractive();
    // item.setScale(0.3);
    
    // 임시 아이템
    const item = this.add.circle(600, 450, 30, 0xf1c40f).setInteractive();

    // 4. 하단 대화창(Dialogue Box) UI 생성
    this.dialogueBox = this.add.container(400, 500);
    const boxBg = this.add.rectangle(0, 0, 760, 150, 0x000000, 0.8);
    boxBg.setStrokeStyle(2, 0xffffff);
    this.dialogueText = this.add.text(-350, -50, '여기를 클릭하거나 스페이스바를 눌러 탐험을 시작하세요.', { fontSize: '20px', fill: '#fff', wordWrap: { width: 700 } });
    this.dialogueBox.add([boxBg, this.dialogueText]);

    // 5. 상호작용 로직
    item.on('pointerdown', () => {
      this.showDialogue('아이템을 발견했습니다! 스토리 라인에 맞게 이 텍스트를 수정하세요.');
      this.tweens.add({ targets: item, scale: 1.2, yoyo: true, duration: 100 });
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.showDialogue('스페이스바를 눌렀습니다. 다음 대사로 넘어갑니다.');
    });
  }

  showDialogue(text) {
    this.dialogueText.setText(text);
  }
}`
  }
};

const DEPT_SYSTEM_PROMPTS = {
  strategy: "당신은 AGMC의 'Strategic Planning Lead'입니다. 게임의 핵심 컨셉과 장르를 기획합니다. 회장님(사용자)이 '고전적인 방식 그대로', '우리가 아는 그 게임' 등으로 원작의 충실한 구현을 요구할 경우, 불필요한 설정이나 재해석을 덧붙이지 말고 요구사항을 100% 수용하여 클래식한 기획안을 제시하세요. 한국어로 답변하세요.",
  content: "당신은 AGMC의 'Creative Narrative Director'입니다. 시나리오와 에셋 묘사를 담당합니다. **가장 중요한 규칙:** 에셋을 제안할 때는 반드시 '[카테고리] 에셋이름 : 외형 묘사' 형식으로 **한 줄에 하나의 에셋만** 작성하세요. (예시: '[캐릭터] 주인공 : 20대 남성 탐험가, 갈색 가죽 자켓을 입고 낡은 모자를 썼으며, 손에는 횃불을 들고 있는 용감한 표정'). **경고:** 절대로 캐릭터의 옷, 장비, 신체 부위를 분리해서 개별 에셋으로 제안하지 마세요! 캐릭터는 무조건 머리부터 발끝까지 입고 있는 옷과 들고 있는 도구를 모두 포함하여 완벽한 '[캐릭터]' 에셋 1개로만 제안해야 합니다. 절대 쪼개지 마세요.",
  engineering: "당신은 AGMC의 'Technical Lead Developer'입니다. Phaser.js(v3) 전문가입니다. **절대 규칙: 대화체나 설명 없이 오직 ```javascript 코드로만 응답하세요. \"알겠습니다\", \"수정하겠습니다\" 같은 말을 절대 쓰지 마세요.** 게임은 반드시 시작 화면(TitleScene)과 본 게임(MainScene)으로 구성하세요. `new Phaser.Game(...)` 코드는 절대 포함하지 마세요. 이미지는 반드시 `preload()` 안에서 `this.load.image('키', window.AGMC_ASSETS['아이디'])` 형태로 로드해야 합니다.",
  ops: "당신은 AGMC의 'Live Operations Manager'입니다. 밸런싱과 개선안을 제시하며, 다른 부서에 수정을 요청할 수 있는 권한이 있습니다.",
  analytics: "당신은 AGMC의 'Data Insights Specialist'입니다. 프로젝트 현황을 진단하고 재미 요소를 데이터 관점에서 분석합니다."
};

export const requestAiTask = async (deptId, instruction, fullState = {}) => {
  if (!openai) throw new Error("VITE_OPENAI_API_KEY가 설정되지 않았습니다.");

  const { projectName, projectData, generatedAssets } = fullState;
  const systemPromptBase = DEPT_SYSTEM_PROMPTS[deptId];

  // Base64 데이터를 프롬프트에 포함하면 TPM(토큰 한도) 초과 에러가 발생하므로, 전역 변수 참조 형태로 안내합니다.
  const assetsInfo = (generatedAssets && generatedAssets.length > 0)
    ? generatedAssets.map(a => `- ID: "${a.id}", 설명: ${a.description}, URL: window.AGMC_ASSETS["${a.id}"]`).join('\n')
    : "생성된 이미지 없음";

  // 이전 컨텍스트에 Base64 이미지가 오염되어 들어간 경우를 대비해 최대 3000자로 자릅니다.
  const projectContext = `
[공유 프로젝트 데이터: ${projectName || '무제'}]
1. 전략기획실(컨셉): ${projectData?.strategy ? projectData.strategy.substring(0, 3000) : '아직 작업 전'}
2. 콘텐츠개발부(설정): ${projectData?.content ? projectData.content.substring(0, 3000) : '아직 작업 전'}
3. 기술구현부(코드): ${projectData?.engineering ? '코드 작성됨' : '아직 작업 전'}
4. 라이브운영부(밸런스): ${projectData?.ops ? projectData.ops.substring(0, 3000) : '아직 작업 전'}
5. 데이터인사이트부(분석): ${projectData?.analytics ? projectData.analytics.substring(0, 3000) : '아직 작업 전'}

[실제 사용 가능한 이미지 에셋 (Engineering 필수 참고)]
${assetsInfo}
* 주의: 위 목록에 있는 ID와 URL 변수(예: window.AGMC_ASSETS["..."])를 사용하여 load.image 하세요.
`;

  const finalSystemPrompt = `
${systemPromptBase}
당신은 모든 부서의 데이터를 인지하고 연계하여 답변해야 하는 팀원입니다. 회장님(사용자)의 지시에 절대적으로 복종하고, 회장님이 기존 아이디어를 철회하고 고전 게임을 요구하면 즉시 의견을 굽히고 따르세요.
[통합 프로젝트 컨텍스트]:
${projectContext}

위 정보를 바탕으로 회장님의 지시에 한국어로 답변하세요.
`;

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
    console.error("GPT 통신 오류:", error);
    if (error.status === 401) throw new Error("API 키가 유효하지 않습니다.");
    if (error.status === 429) {
      if (error.message && error.message.includes('tokens per min')) {
        throw new Error("요청이 너무 깁니다(토큰 한도 초과). 에셋 묘사나 이전 컨텍스트가 너무 길어 발생했습니다.");
      }
      throw new Error("사용 한도(Quota)를 초과했습니다. OpenAI 계정의 결제 정보를 확인해 주세요.");
    }
    throw error;
  }
};

export const requestImageGeneration = async (prompt, numImages = 1, category = "캐릭터") => {
  let categoryRule = "";
  if (category === "배경") {
    categoryRule = "배경 아트입니다. 절대로 사람, 얼굴, 캐릭터, 생물을 그리지 마세요. 오직 풍경이나 환경만 그리세요.";
  } else if (category === "아이템" || category === "오브젝트") {
    categoryRule = "단일 아이템 아트입니다. 사람이나 신체 부위가 나타나지 않아야 합니다.";
  } else {
    categoryRule = "캐릭터 아트입니다.";
  }

  const finalPrompt = `2D 도트 스타일, 흰색 배경. [규칙: ${categoryRule}] [요청: ${prompt}] 절대 사람을 그리지 마세요(배경/아이템일 때).`;

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
  } catch (error) {
    if (error.status === 429) {
      throw new Error("이미지 생성 사용 한도(Quota)를 초과했습니다. 결제 정보를 확인해 주세요.");
    }
    
    console.warn("gpt-image-2 실패, gpt-image-1로 시도:", error.message);
    try {
      const response = await imageOpenai.images.generate({
        model: "gpt-image-1",
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
      if (e.status === 429) {
        throw new Error("이미지 생성 사용 한도(Quota)를 초과했습니다. 결제 정보를 확인해 주세요.");
      }
      console.error("이미지 생성 최종 실패:", e);
      throw e;
    }
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
