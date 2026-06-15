import OpenAI from 'openai';

// Vite 환경 변수에서 OpenAI API 키를 가져옵니다. 
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
// 이미지 전용 키가 설정되어 있으면 그것을 쓰고, 없으면 기본 키를 사용합니다.
const imageApiKey = import.meta.env.VITE_IMAGE_OPENAI_API_KEY || apiKey;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // 백엔드 없이 프론트에서 직접 호출할 때 필수 옵션
}) : null;

const imageOpenai = imageApiKey ? new OpenAI({
  apiKey: imageApiKey,
  dangerouslyAllowBrowser: true
}) : null;

// 공통 게임 템플릿 (기술구현 AI에게 참고용으로 전달하거나 UI에서 제안)
// 모든 템플릿은 Phaser 3 문법에 맞춰 완벽하게 동작하는 보일러플레이트 코드로 작성됨
export const GENRE_TEMPLATES = {
  minesweeper: {
    name: "지뢰찾기",
    description: "그리드 클릭, 지뢰 배치 및 승패 판정 로직이 포함된 기본 지뢰찾기",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  create() {
    this.size = 8;
    this.tileSize = 50;
    this.offset = 100;
    this.mines = 10;
    this.grid = [];
    this.gameOver = false;

    // UI
    this.statusText = this.add.text(400, 30, 'Minesweeper: Find the safe tiles!', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

    // 지뢰 위치 생성
    const minePositions = new Set();
    while(minePositions.size < this.mines) {
      minePositions.add(Math.floor(Math.random() * (this.size * this.size)));
    }

    // 그리드 생성
    for(let y=0; y<this.size; y++) {
      for(let x=0; x<this.size; x++) { 
        const isMine = minePositions.has(y * this.size + x);
        const cell = this.add.rectangle(this.offset + x * this.tileSize, this.offset + y * this.tileSize, 45, 45, 0x444444).setInteractive();
        const text = this.add.text(this.offset + x * this.tileSize, this.offset + y * this.tileSize, '', { fontSize: '20px', fill: '#000' }).setOrigin(0.5);
        
        cell.on('pointerdown', () => {
          if(this.gameOver || cell.fillColor !== 0x444444) return;
          
          if(isMine) {
            cell.setFillStyle(0xff0000);
            text.setText('💣');
            this.statusText.setText('Game Over! You hit a mine.');
            this.gameOver = true;
          } else {
            cell.setFillStyle(0x999999);
            // 인접 지뢰 개수 계산 로직 (간단화됨)
            text.setText('✓');
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
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  preload() { 
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/ghost.png');
    this.load.image('npc', 'https://labs.phaser.io/assets/sprites/star_coin.png');
  }
  create() {
    this.add.text(400, 30, 'Arrow keys to move. Touch the star to interact!', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

    // NPC 생성
    this.npc = this.physics.add.staticSprite(600, 300, 'npc').setScale(2);

    // 플레이어 생성
    this.player = this.physics.add.sprite(200, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 조작키
    this.cursors = this.input.keyboard.createCursorKeys();

    // 상호작용 로직
    this.physics.add.overlap(this.player, this.npc, () => {
      if(!this.dialogue) {
        this.dialogue = this.add.text(600, 250, 'Hello traveler!', { fontSize: '18px', fill: '#ffff00' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => { this.dialogue.destroy(); this.dialogue = null; });
      }
    });
  }
  update() {
    this.player.setVelocity(0);
    const speed = 200;
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
  }
}`
  },
  card: {
    name: "카드 배틀",
    description: "핸드에서 카드를 드래그하여 플레이하는 기본 턴제 로직",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  create() {
    this.add.text(400, 50, 'Drag cards to the play area!', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    
    // 플레이 영역 (드롭 존)
    const playArea = this.add.rectangle(400, 250, 600, 200, 0x222222).setStrokeStyle(4, 0x444444);
    this.physics.add.existing(playArea, true); // static

    // 카드 생성기
    const createCard = (x, y, name, color) => {
      const card = this.add.rectangle(x, y, 100, 150, color).setInteractive({ draggable: true });
      this.physics.add.existing(card);
      const text = this.add.text(x, y, name, { fontSize: '16px', fill: '#000', fontWeight: 'bold' }).setOrigin(0.5);
      
      // 드래그 로직
      card.on('drag', (pointer, dragX, dragY) => {
        card.x = dragX; card.y = dragY; text.x = dragX; text.y = dragY;
        card.setDepth(100); text.setDepth(101);
      });
      card.on('dragend', () => {
        card.setDepth(1); text.setDepth(2);
        // 플레이 영역에 놓였는지 확인
        if (Phaser.Geom.Intersects.RectangleToRectangle(card.getBounds(), playArea.getBounds())) {
          text.setText('Played!');
          card.disableInteractive();
          card.setFillStyle(0x555555);
        } else {
          // 원래 위치로 복귀 (간단히)
          card.x = x; card.y = y; text.x = x; text.y = y;
        }
      });
    };

    // 내 패(핸드)에 카드 생성
    createCard(250, 500, 'Attack', 0xff6666);
    createCard(400, 500, 'Defend', 0x6666ff);
    createCard(550, 500, 'Heal', 0x66ff66);
  }
}`
  },
  clicker: {
    name: "방치형/클리커",
    description: "버튼 터치(클릭) 및 자동 재화 생산 로직",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); this.gold = 0; this.autoGold = 0; }
  create() {
    this.goldText = this.add.text(400, 150, 'Gold: 0', { fontSize: '48px', fill: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
    this.autoText = this.add.text(400, 200, 'Auto: +0/sec', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);

    // 메인 클릭 요소
    const target = this.add.circle(400, 350, 100, 0x4cd137).setInteractive();
    const targetLabel = this.add.text(400, 350, 'CLICK!', { fontSize: '28px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);

    target.on('pointerdown', () => {
      this.gold += 1;
      this.updateUI();
      this.tweens.add({ targets: [target, targetLabel], scale: 0.9, duration: 50, yoyo: true });
    });

    // 업그레이드 상점
    const upgradeBtn = this.add.rectangle(400, 500, 200, 50, 0x3498db).setInteractive();
    this.add.text(400, 500, 'Buy Auto-click (10g)', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    
    upgradeBtn.on('pointerdown', () => {
      if(this.gold >= 10) {
        this.gold -= 10;
        this.autoGold += 1;
        this.updateUI();
        this.tweens.add({ targets: upgradeBtn, alpha: 0.5, duration: 100, yoyo: true });
      }
    });

    // 방치형 루프 (1초마다 자동 생산)
    this.time.addEvent({
      delay: 1000,
      callback: () => { this.gold += this.autoGold; this.updateUI(); },
      loop: true
    });
  }
  
  updateUI() {
    this.goldText.setText('Gold: ' + this.gold);
    this.autoText.setText('Auto: +' + this.autoGold + '/sec');
  }
}`
  },
  story: {
    name: "스토리 어드벤처",
    description: "텍스트 기반의 선택지 및 씬 전환 로직",
    code: `class MainScene extends Phaser.Scene {
  constructor() { super('MainScene'); }
  create() {
    // 배경
    this.add.rectangle(400, 300, 800, 600, 0x111111);
    
    // 대화창
    this.add.rectangle(400, 450, 700, 200, 0x000000).setStrokeStyle(2, 0xffffff);
    this.storyText = this.add.text(400, 400, '어두운 숲속에서 눈을 떴습니다.\\n어디로 가시겠습니까?', { 
      fontSize: '22px', fill: '#fff', align: 'center', wordWrap: { width: 650 } 
    }).setOrigin(0.5);

    // 선택지 버튼 컨테이너
    this.choicesContainer = this.add.container(400, 500);

    const makeChoice = (x, y, text, callback) => {
      const btn = this.add.rectangle(x, y, 200, 40, 0x333333).setInteractive();
      const label = this.add.text(x, y, text, { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
      btn.on('pointerover', () => btn.setFillStyle(0x555555));
      btn.on('pointerout', () => btn.setFillStyle(0x333333));
      btn.on('pointerdown', () => {
        btn.setFillStyle(0x777777);
        callback();
      });
      this.choicesContainer.add([btn, label]);
    };

    // 시나리오 흐름 분기
    const scene2 = () => {
      this.storyText.setText('빛을 따라가니 작은 오두막이 보입니다.\\n하지만 문은 굳게 잠겨있습니다.');
      this.choicesContainer.removeAll(true);
      makeChoice(0, 0, '문을 부순다', () => this.storyText.setText('Game Over: 문을 부수다 함정에 당했습니다.'));
    };

    const scene3 = () => {
      this.storyText.setText('어둠 속에서 괴물이 나타났습니다!');
      this.choicesContainer.removeAll(true);
      makeChoice(0, 0, '도망친다', () => this.storyText.setText('무사히 도망쳤습니다. (엔딩 A)'));
    };

    // 초기 선택지 배치
    makeChoice(-150, 0, '빛이 보이는 곳으로', scene2);
    makeChoice(150, 0, '더 깊은 어둠 속으로', scene3);
  }
}`
  }
};

// 회장님이 주신 "부서별 맞춤형 페르소나" 프롬프트 시스템
const DEPT_SYSTEM_PROMPTS = {
  strategy: 
    "당신은 AGMC의 '전략기획 AI'입니다. 게임의 핵심 컨셉, 장르, 타겟 유저, 메인 루프를 기획합니다. 수익 모델(BM)은 배제하고 순수하게 '재미'와 '게임성'에 집중하세요. 최대한 구체적이고 깊이 있는 기획을 한국어로 제공하세요.",
  content: 
    "당신은 AGMC의 '콘텐츠개발 AI'입니다. 게임의 세계관, 시나리오, 캐릭터 설정을 담당합니다.\n" +
    "회장님의 지시를 바탕으로 필요한 비주얼 에셋(이미지)들을 제안하세요. 답변 시 반드시 아래 형식을 지켜주세요:\n\n" +
    "1. 에셋 제안은 반드시 **[캐릭터], [배경], [아이템]** 카테고리로 분류하세요.\n" +
    "2. **주인공(Protagonist)**을 가장 먼저 제안하고, 그 다음 배경, 필요한 오브젝트 순서로 작성하세요.\n" +
    "3. 각 에셋은 반드시 한 줄의 핵심 묘사(이미지 생성용)를 포함해야 하며, 형태는 '- [카테고리] 이름: 상세 묘사'여야 합니다.\n" +
    "   예: - [캐릭터] 마법사 주인공: 보라색 로브를 입고 흰 수염이 난 노인 마법사, 나무 지팡이를 들고 있음.\n\n" +
    "풍부한 창의성을 발휘하여 기술구현부가 참고할 수 있도록 상세히 답변하세요.",
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
    templateGuide = "\n[참고 가능한 완벽한 기초 구조 (Templates)]: " + JSON.stringify(GENRE_TEMPLATES);
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
 * @param {string} prompt - 이미지 생성을 위한 설명
 * @param {number} numImages - 생성할 이미지 개수 (DALL-E 3는 1개만 지원하므로 루프 처리)
 */
export const requestImageGeneration = async (prompt, numImages = 1) => {
  const basePrompt = `사용자가 요청한 정보를 클래식 온라인 게임 캐릭터 및 사물로 재해석하세요. 도트 그래픽 기반의 치비(Chibi) 아바타 스타일이며, 옛날 한국 MMORPG 캐릭터 선택창에 나올 법한 느낌입니다.
요청된 대상의 특징을 유지하되, 이를 단순화된 도트 디자인으로 표현하세요.
배경은 완벽한 흰색(Pure white background)이어야 쉽게 누끼를 딸 수 있습니다. 전신(Full body), 정면(Front view) 구도.

[사용자 요청 사항]: ${prompt}

[금지 사항]: 실사, 애니메이션 일러스트, 3D 렌더링, 복잡한 배경, 텍스트.`;

  const results = [];
  
  // 1. OpenAI DALL-E 3 시도
  if (imageOpenai) {
    try {
      console.log("DALL-E 3 이미지 생성 시도 중...");
      for (let i = 0; i < numImages; i++) {
        const response = await imageOpenai.images.generate({
          model: "dall-e-3",
          prompt: basePrompt.substring(0, 4000),
          size: "1024x1024",
          quality: "hd", 
          n: 1 
        });

        for (const item of response.data) {
          const b64 = item.b64_json || (item.url ? await fetchAndConvertToBase64(item.url) : null);
          if (b64) {
            const transparent = await removeWhiteBackground(b64);
            results.push(transparent);
          }
        }
      }
      if (results.length > 0) return results;
    } catch (error) {
      console.warn("DALL-E 3 생성 실패:", error.message);
      
      // 2. OpenAI DALL-E 2 폴백 시도
      if (error.status === 400 || error.status === 404 || error.message.includes('model')) {
        console.warn("OpenAI 모델 접근 권한이 없거나 모델을 찾을 수 없습니다. DALL-E 2로 폴백합니다.");
        try {
          const response = await imageOpenai.images.generate({
            model: "dall-e-2",
            prompt: basePrompt.substring(0, 1000),
            size: "1024x1024",
            n: numImages 
          });

          for (const item of response.data) {
            const b64 = item.b64_json || (item.url ? await fetchAndConvertToBase64(item.url) : null);
            if (b64) {
              const transparent = await removeWhiteBackground(b64);
              results.push(transparent);
            }
          }
          if (results.length > 0) return results;
        } catch (fallbackError) {
          console.error("DALL-E 2 폴백 실패:", fallbackError.message);
        }
      }
    }
  }

  // 3. Pollinations AI 최종 폴백 (OpenAI가 실패하거나 API 키가 없을 경우)
  console.log("외부 무료 AI 서비스(Pollinations)를 통해 이미지를 생성합니다...");
  try {
    for (let i = 0; i < numImages; i++) {
      // Pollinations AI는 prompt를 URL 인코딩하여 전달
      // 도트 스타일을 강조하기 위해 프롬프트에 키워드 추가
      const pollinationsPrompt = encodeURIComponent(basePrompt + " (pixel art, 8-bit, game asset style, pure white background)");
      const imageUrl = `https://image.pollinations.ai/prompt/${pollinationsPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
      
      const b64 = await fetchAndConvertToBase64(imageUrl);
      if (b64) {
        const transparent = await removeWhiteBackground(b64);
        results.push(transparent);
      }
    }
    return results;
  } catch (pollinationsError) {
    console.error("최종 폴백 서비스 실패:", pollinationsError.message);
    throw new Error("모든 이미지 생성 서비스가 실패했습니다. 네트워크 상태나 API 설정을 확인해주세요.");
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
