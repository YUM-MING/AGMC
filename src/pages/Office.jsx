import { useEffect, useState } from 'react';
import Phaser from 'phaser';
import { useNavigate } from 'react-router-dom';
import { requestAiTask, requestImageGeneration, GENRE_TEMPLATES } from '../services/ai';
import { useProjectStore } from '../store/projectStore';

// 전략기획실 초보자용 가이드 (제안)
const STRATEGY_SUGGESTIONS = [
  { name: '지뢰찾기', prompt: '지뢰찾기 장르의 게임을 만들고 싶어. 핵심 컨셉과 플레이 방식(메인 루프)을 기획해줘.' },
  { name: '탑다운 RPG', prompt: '옛날 포켓몬스터 같은 탑다운 2D RPG 게임을 기획해줘. 전투보다는 탐험과 퍼즐 요소가 강했으면 좋겠어.' },
  { name: '카드 배틀', prompt: '간단한 턴제 덱빌딩 카드 게임을 만들고 싶어. 유저 타겟층과 핵심적인 재미 요소를 기획해줘.' },
  { name: '방치형 클리커', prompt: '화면을 터치해서 돈을 모으고 업그레이드하는 방치형 클리커 게임을 기획해줘. 중독성 있는 메인 루프를 짜줘.' },
  { name: '스토리 어드벤처', prompt: '스토리 중심의 선택형 어드벤처 게임을 기획해줘. 플레이어의 선택에 따라 결말이 달라지는 구조야.' }
];

// 부서별 자산 매핑
const DEPT_ASSETS = {
  strategy: { key: 'char_strategy', path: 'assets/char_strategy.png' },
  content: { key: 'char_content', path: 'assets/char_content.png' },
  engineering: { key: 'char_engineering', path: 'assets/char_engineering.png' },
  ops: { key: 'char_ops', path: 'assets/char_ops.png' },
  analytics: { key: 'char_analytics', path: 'assets/char_analytics.png' }
};

class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
    this.player = null;
    this.cursors = null;
    this.spaceKey = null;
    this.dialogueText = null;
    this.currentDept = null; 
    this.reactCallback = null; 
    this.walls = null; // 벽 그룹
    this.projectData = null;

    // 부서 위치 및 전문 AI 사원 이름 최적화
    this.departments = [
      { id: 'strategy', name: '전략기획실', color: 0x00a8ff, colorStr: '#00a8ff', x: 150, y: 220, ai: 'Strategic Planning Lead' },
      { id: 'content', name: '콘텐츠개발부', color: 0xe84118, colorStr: '#e84118', x: 650, y: 220, ai: 'Creative Narrative Director' },
      { id: 'engineering', name: '기술구현부', color: 0x4cd137, colorStr: '#4cd137', x: 150, y: 450, ai: 'Technical Lead Developer' },
      { id: 'ops', name: '라이브운영부', color: 0xfbc531, colorStr: '#fbc531', x: 650, y: 450, ai: 'Live Operations Manager' },
      { id: 'analytics', name: '데이터인사이트부', color: 0x9c88ff, colorStr: '#9c88ff', x: 400, y: 350, ai: 'Data Insights Specialist' },
    ];
  }

  init(data) {
    this.reactCallback = data.onOpenModal; 
    this.projectData = data.projectData;
    this.ceoName = data.ceoName;
  }

  preload() {
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('office_bg', 'assets/background.png');
    Object.values(DEPT_ASSETS).forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  create() {
    // 1. 배경 설정
    const bg = this.add.image(400, 300, 'office_bg');
    bg.setDisplaySize(800, 600);

    // 2. 물리 벽(Collision Walls) 설정 - 투명하게 배치
    this.walls = this.physics.add.staticGroup();
    this.createCollisionMap();

    // 3. 부서 및 캐릭터 배치
    this.departments.forEach(dept => {
      const charKey = DEPT_ASSETS[dept.id].key;
      const charSprite = this.add.sprite(dept.x, dept.y, charKey);
      charSprite.setDisplaySize(100, 100);
      charSprite.setDepth(dept.y);
      
      this.add.ellipse(dept.x, dept.y + 40, 80, 30, dept.color, 0.3);
      
      this.tweens.add({
        targets: charSprite,
        y: dept.y - 10,
        duration: 2000,
        ease: 'Power1.easeInOut',
        yoyo: true,
        repeat: -1
      });

      const zone = this.add.zone(dept.x, dept.y + 10, 100, 80);
      this.physics.add.existing(zone, true);
      dept.zone = zone;
    });

    // 4. 플레이어 스폰 - 회장실(중앙 상단)에서 시작
    this.player = this.physics.add.sprite(400, 120, 'player');
    this.player.setScale(1.1);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls); // 벽 충돌 적용

    // 하단 대화창
    this.dialogueBox = this.add.container(400, 550).setDepth(3000);
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x000000, 0.8);
    boxBg.lineStyle(2, 0x00a8ff, 1);
    boxBg.fillRoundedRect(-380, -25, 760, 50, 8);
    boxBg.strokeRoundedRect(-380, -25, 760, 50, 8);
    this.dialogueBox.add(boxBg);

    this.dialogueText = this.add.text(0, 0, this.getGuideMessage(), {
      font: "bold 15px Arial", fill: "#ffffff", align: 'center'
    }).setOrigin(0.5);
    this.dialogueBox.add(this.dialogueText);

    this.createAnimations();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 키보드 이벤트 캡처 해제 (HTML 입력창에서 스페이스바 및 방향키 사용 가능하게)
    this.input.keyboard.removeCapture('SPACE,UP,DOWN,LEFT,RIGHT');
  }

  getGuideMessage() {
    if (!this.projectData?.strategy) return `반갑습니다 ${this.ceoName}! 먼저 [전략기획실]에 방문하여 게임의 핵심 컨셉을 정해주세요.`;
    if (!this.projectData?.content) return "컨셉이 나왔군요! 이제 [콘텐츠개발부]에서 세계관과 비주얼 스타일을 구체화하세요.";
    if (!this.projectData?.engineering) return "기획이 탄탄합니다. [기술구현부]에 가서 실제 플레이 가능한 코드를 요청하세요!";
    return "프로토타입이 준비되었습니다! [라이브운영부]나 [데이터인사이트부]에서 완성도를 높여보세요.";
  }

  createCollisionMap() {
    const addWall = (x, y, w, h) => {
      const wall = this.add.rectangle(x, y, w, h, 0xff0000, 0); // 0을 0.5로 바꾸면 빨간 벽이 보입니다
      this.physics.add.existing(wall, true); // true for static body
      this.walls.add(wall);
    };

    addWall(400, -5, 1000, 10); // 상단
    addWall(400, 605, 800, 10); // 하단
    addWall(-5, 300, 10, 600); // 좌측
    addWall(805, 300, 10, 600); // 우측
    addWall(280, 80, 20, 160); 
    addWall(520, 80, 20, 160); 
    addWall(400, 320, 80, 60); 
    addWall(150, 200, 100, 40); 
    addWall(650, 200, 100, 40); 
    addWall(150, 430, 100, 40); 
    addWall(650, 430, 100, 40); 
  }

  createAnimations() {
    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [ { key: 'player', frame: 4 } ], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });
  }

  update() {
    if (!this.player || !this.player.body) return;

    this.player.setDepth(this.player.y);

    let overlappingDept = null;
    this.departments.forEach(dept => {
      const bounds = dept.zone.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), bounds)) {
        overlappingDept = dept;
      }
    });

    if (overlappingDept) {
      if (this.currentDept !== overlappingDept) {
        this.currentDept = overlappingDept;
        this.dialogueText.setText(`[${this.currentDept.name}] ${this.currentDept.ai}에게 업무 지시 (Space)`);
        this.dialogueText.setFill(this.currentDept.colorStr);
      }
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.reactCallback) {
        this.reactCallback(this.currentDept);
      }
    } else {
      if (this.currentDept) {
        this.currentDept = null;
        this.dialogueText.setText(this.getGuideMessage());
        this.dialogueText.setFill("#ffffff");
      }
    }

    this.player.setVelocity(0);
    const speed = 200;
    
    // 모달창이 열려있지 않을 때만 캐릭터 이동 가능
    if (this.input.keyboard.enabled) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play('left', true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play('right', true);
      } else if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
      } else {
        this.player.anims.play('turn');
      }
    } else {
      this.player.anims.play('turn');
    }
  }
}

// 유틸리티: 에셋 ID 생성 (순수성 규칙 준수)
const generateAssetId = () => Math.random().toString(36).substr(2, 9);

export default function Office() {
  const navigate = useNavigate();
  const { projectName, isProjectStarted, projectData, startProject, updateDeptData, resetProject, generatedAssets, addAsset, showSuggestions, ceoName } = useProjectStore();
  
  const [activeDept, setActiveDept] = useState(null); 
  const [instruction, setInstruction] = useState(""); 
  const [aiReply, setAiReply] = useState("");         
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [localShowSuggestions, setLocalShowSuggestions] = useState(true);
  const [showGamePreview, setShowGamePreview] = useState(false);
  const [previewImages, setPreviewImages] = useState([]); // 생성된 이미지 미리보기

  // 보고서에서 에셋 관련 묘사만 추출하는 헬퍼 (카테고리 정보 포함)
  const extractedPrompts = activeDept?.id === 'content' && typeof aiReply === 'string' && aiReply ? 
    (() => {
      const lines = aiReply.split('\n').map(l => l.trim());
      const results = [];
      let currentCategory = '캐릭터';

      lines.forEach(line => {
        // 카테고리 전환 감지 (예: [배경], [아이템], [캐릭터])
        const categoryMatch = line.match(/^\[(캐릭터|배경|아이템|오브젝트)\]/);
        if (categoryMatch) {
          currentCategory = categoryMatch[1];
        }

        // 실제 에셋 항목 추출 (불렛포인트나 번호로 시작하고 내용이 긴 경우)
        // 외형, 복장, 성격 등 세부 항목이 별도 에셋으로 분리되지 않도록 ':' 가 포함된 메인 항목 위주로 추출
        if ((line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) && line.length > 10) {
          const clean = line.replace(/^[-*\d.]+\s*/, '').replace(/^\[.*?\]\s*/, '');
          
          // '이름:', '외형:', '배경:' 처럼 구체적인 정의가 있는 라인만 에셋 후보로 선정
          // 단순히 세부 묘사 라인(예: "- 빨간 모자를 쓰고 있음")은 제외
          if (clean.includes(':')) {
            const label = clean.split(':')[0].trim();
            const prompt = clean.trim();
            results.push({ category: currentCategory, label, prompt });
          }
        }
      });
      return results;
    })()
    : [];

  useEffect(() => {
    // 모달이 켜지면 Phaser의 키보드 입력을 무시하도록 처리
    if (window.phaserGame?.input?.keyboard) {
      window.phaserGame.input.keyboard.enabled = !(activeDept || showGamePreview || !isProjectStarted);
    }
  }, [activeDept, showGamePreview, isProjectStarted]);

  // 실시간 프로젝트 데이터 동기화
  useEffect(() => {
    if (window.phaserGame) {
      const scene = window.phaserGame.scene.getScene('OfficeScene');
      if (scene) {
        scene.projectData = projectData;
        if (!scene.currentDept) {
          scene.dialogueText?.setText(scene.getGuideMessage());
        }
      }
    }
  }, [projectData]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'agmc-office-container',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
      },
      scene: [OfficeScene]
    };

    const game = new Phaser.Game(config);
    window.phaserGame = game;

    game.scene.start('OfficeScene', {
      projectData: useProjectStore.getState().projectData,
      ceoName: useProjectStore.getState().ceoName,
      onOpenModal: (dept) => {
        const latestProjectData = useProjectStore.getState().projectData;
        const savedReply = latestProjectData[dept.id] || "";
        
        setActiveDept(dept);
        setInstruction("");
        setPreviewImages([]);
        setAiReply(savedReply); // 기존 데이터 확실히 복구
      }
    });

    return () => {
      game.destroy(true);
      window.phaserGame = null;
    };
  }, []);

  const handleApprove = async () => {
    if (!activeDept || !instruction.trim()) return alert("지시 내용을 입력하세요.");
    setLoading(true);

    try {
      const fullState = { projectName, projectData, generatedAssets }; 
      const reply = await requestAiTask(activeDept.id, instruction, fullState);
      
      if (reply) {
        setAiReply(reply);
        updateDeptData(activeDept.id, reply);
      }
    } catch (error) {
      console.error("AI 업무 처리 중 상세 오류:", error);
      alert("업무 처리 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (customPrompt, category = "캐릭터") => {
    const targetPrompt = typeof customPrompt === 'string' ? customPrompt : instruction;
    if (!targetPrompt.trim()) return alert("이미지 생성을 위한 설명을 입력하세요.");
    
    setImgLoading(true);
    setPreviewImages([]);

    try {
      // 카테고리 정보(배경, 아이템 등)를 AI에게 명확히 전달
      const urls = await requestImageGeneration(targetPrompt, 2, category); 
      setPreviewImages(urls.map(url => ({ url, description: targetPrompt })));
    } catch (error) {
      console.error(error);
      alert("이미지 생성에 실패했습니다: " + (error.message || "알 수 없는 오류"));
    } finally {
      setImgLoading(false);
    }
  };

  const applySelectedImage = (imgObj) => {
    const id = generateAssetId();
    const newAsset = { id, url: imgObj.url, description: imgObj.description };
    addAsset(newAsset);
    setPreviewImages([]);
    alert("에셋이 프로젝트에 성공적으로 등록되었습니다!");
  };

  const handleClose = () => {
    setActiveDept(null);
    setInstruction("");
    setAiReply("");
    setPreviewImages([]);
  };

  const handleReset = () => {
    if (confirm("정말로 모든 프로젝트 데이터를 삭제하고 초기화하시겠습니까?")) {
      resetProject();
    }
  };

  const handleStartProject = () => {
    if (!newProjectName.trim()) return alert("프로젝트 이름을 입력하세요.");
    startProject(newProjectName, ceoName, localShowSuggestions);
    setNewProjectName("");
  };

  const applyEngineeringTemplate = (templateKey) => {
    const template = GENRE_TEMPLATES[templateKey];
    setInstruction(`[${template.name} 템플릿 사용]\n이 템플릿을 기반으로 게임 로직을 작성해줘. 우리 게임의 컨셉과 비주얼 에셋에 맞게 기능을 수정하고 살을 붙여줘.\n\n참고 코드:\n\`\`\`javascript\n${template.code}\n\`\`\``);
  };

  const applyStrategyTemplate = (prompt) => {
    setInstruction(prompt);
  };

  const stopPropagation = (e) => e.stopPropagation();

  const getExecutableCode = () => {
    const code = projectData.engineering;
    if (!code) return "";
    
    const match = typeof code === 'string' ? (code.match(/```javascript\n?([\s\S]*?)```/) || code.match(/```js\n?([\s\S]*?)```/) || code.match(/```([\s\S]*?)```/)) : null;
    let jsCode = match ? match[1].trim() : (typeof code === 'string' ? code : "");

    // export 구문 및 import 구문 제거 (브라우저 스크립트 실행 환경 호환용)
    jsCode = jsCode.replace(/export\s+default\s+class/g, 'class');
    jsCode = jsCode.replace(/export\s+default\s+/g, '');
    jsCode = jsCode.replace(/export\s+class/g, 'class');
    jsCode = jsCode.replace(/export\s+/g, '');
    jsCode = jsCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, ''); // import Phaser from 'phaser' 제거

    // 메인 씬 클래스 이름 찾기 (가장 먼저 나오는 Phaser.Scene 상속 클래스)
    const sceneClassMatch = jsCode.match(/class\s+(\w+)\s+extends\s+(?:Phaser\.)?Scene/);
    const mainSceneName = sceneClassMatch ? sceneClassMatch[1] : 'MainScene';

    const assetsObj = {};
    generatedAssets.forEach(a => {
      assetsObj[a.id] = a.url;
    });
    const assetsJsonStr = JSON.stringify(assetsObj);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AGMC Prototype</title>
        <script src="https://cdn.jsdelivr.net/npm/phaser@3.88.0/dist/phaser.min.js"></script>
        <style>
          body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; color: white; font-family: sans-serif; }
          canvas { box-shadow: 0 0 20px rgba(76,209,55,0.5); border-radius: 8px; }
          #error-display { padding: 20px; text-align: center; max-width: 80%; }
          .error-title { color: #ff4757; margin-bottom: 10px; }
          .error-msg { font-family: monospace; background: #222; padding: 10px; border-radius: 4px; font-size: 14px; text-align: left; overflow-wrap: break-word; }
        </style>
      </head>
      <body>
        <div id="game-container"></div>
        <div id="error-display" style="display:none"></div>
        <script>
          // 마우스 우클릭 시 컨텍스트 메뉴 안 뜨도록 방지 (지뢰찾기 깃발 용도)
          document.addEventListener('contextmenu', event => event.preventDefault());

          window.AGMC_ASSETS = ${assetsJsonStr};
          const errorDisplay = document.getElementById('error-display');
          const gameContainer = document.getElementById('game-container');
          
          function showError(title, msg) {
            gameContainer.style.display = 'none';
            errorDisplay.style.display = 'block';
            errorDisplay.innerHTML = '<h2 class="error-title">' + title + '</h2><div class="error-msg">' + msg + '</div><p style="margin-top:20px; color:#888;">기술구현부 AI에게 오류 내용을 전달하고 수정을 요청하세요.</p>';
          }

          window.onerror = function(msg, url, lineNo, columnNo, error) {
            showError("구문 또는 런타임 오류가 발생했습니다", msg);
            return false;
          };
        </script>
        <script>
          window.onload = () => {
            try {
              // --- AI Generated Code Start ---
              ${jsCode}
              // --- AI Generated Code End ---

              if (typeof ${mainSceneName} === 'undefined') {
                showError("씬 클래스가 정의되지 않았습니다", "AI가 작성한 코드에 'class ... extends Phaser.Scene' 정의가 포함되어 있는지 확인하세요.");
              } else {
                const config = {
                  type: Phaser.AUTO,
                  width: 800,
                  height: 600,
                  parent: 'game-container',
                  physics: {
                    default: 'arcade',
                    arcade: { gravity: { y: 300 }, debug: false }
                  },
                  scene: ${mainSceneName}
                };
                new Phaser.Game(config);
              }
            } catch(e) {
              console.error("AI 코드 파싱/실행 에러:", e);
              showError("코드 실행 중 오류가 발생했습니다", e.message);
            }
          };
        </script>
      </body>
      </html>
    `;
  };

  return (
    <div style={{ 
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a',
      color: '#fff', fontFamily: 'Arial, sans-serif', position: 'relative'
    }}>
      <div style={{ width: '800px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#00a8ff', letterSpacing: '2px', fontSize: '20px' }}>AGMC HQ</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ padding: '3px 8px', backgroundColor: 'rgba(0,168,255,0.1)', border: '1px solid #00a8ff', borderRadius: '4px', color: '#00a8ff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1' }}>
              CEO: {ceoName}
            </div>
            {isProjectStarted && (
              <div style={{ padding: '3px 8px', backgroundColor: 'rgba(76,209,55,0.1)', border: '1px solid #4cd137', borderRadius: '4px', color: '#4cd137', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1' }}>
                PROJ: {projectName}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {projectData.engineering && (
            <button 
              onClick={() => setShowGamePreview(true)} 
              style={{ padding: '6px 14px', backgroundColor: '#4cd137', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', boxShadow: '0 0 15px rgba(76,209,55,0.6)', transition: 'all 0.2s' }}
            >
              🎮 즉시 실행
            </button>
          )}
          <button 
            onClick={() => {
              const data = JSON.stringify({ projectName, projectData, generatedAssets }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${projectName}_backup.json`;
              a.click();
              URL.revokeObjectURL(url);
            }} 
            style={{ padding: '5px 10px', background: 'none', border: '1px solid #00a8ff', color: '#00a8ff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
          >
            EXPORT
          </button>
          <button 
            onClick={() => alert('프로젝트가 브라우저에 자동 저장되었습니다.')} 
            style={{ padding: '5px 10px', background: 'none', border: '1px solid #4cd137', color: '#4cd137', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
          >
            SAVE
          </button>
          <button onClick={handleReset} style={{ padding: '5px 10px', background: 'none', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
            RESET
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '5px 10px', background: 'none', border: '1px solid #333', color: '#888', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
            EXIT
          </button>
        </div>
      </div>

      <div id="agmc-office-container" style={{ 
        borderRadius: '12px', overflow: 'hidden', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid #222'
      }}></div>

      {showGamePreview && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 300 }}>
          <div style={{ width: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, color: '#4cd137' }}>🎮 {projectName} - 프로토타입 실행 중</h2>
            <button 
              onClick={() => setShowGamePreview(false)}
              style={{ padding: '6px 16px', backgroundColor: '#ff4757', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
            >
              실행 종료
            </button>
          </div>
          <iframe 
            srcDoc={getExecutableCode()} 
            style={{ width: '800px', height: '600px', border: '2px solid #4cd137', borderRadius: '8px', backgroundColor: '#000' }} 
            sandbox="allow-scripts allow-same-origin"
            title="Game Preview"
          />
        </div>
      )}

      {!isProjectStarted && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: '#16161a', border: '2px solid #00a8ff', borderRadius: '12px', width: '450px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#00a8ff', marginTop: 0 }}>🏢 프로젝트 시작</h2>
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={stopPropagation}
              placeholder="프로젝트 이름 입력..."
              style={{ width: '100%', padding: '15px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', marginBottom: '25px', textAlign: 'center', fontSize: '18px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '25px' }}>
              <input 
                type="checkbox" 
                id="showSuggestions"
                checked={localShowSuggestions}
                onChange={(e) => setLocalShowSuggestions(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="showSuggestions" style={{ color: '#aaa', fontSize: '13px' }}>부서별 가이드 표시</label>
            </div>
            <button 
              onClick={handleStartProject}
              style={{ width: '100%', padding: '15px', backgroundColor: '#00a8ff', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', borderRadius: '4px' }}
            >
              업무 시작
            </button>
          </div>
        </div>
      )}

      {activeDept && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#16161a', border: `2px solid ${activeDept.colorStr}`, borderRadius: '12px', width: '800px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', gap: '20px', maxHeight: '90vh', boxSizing: 'border-box' }}>
            <div style={{ width: '200px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '200px', height: '200px', backgroundColor: '#000', borderRadius: '8px', border: `1px solid ${activeDept.colorStr}`, marginBottom: '10px', overflow: 'hidden' }}>
                <img src={DEPT_ASSETS[activeDept.id].path} alt={activeDept.ai} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ margin: '0', color: activeDept.colorStr, fontSize: '15px' }}>{activeDept.ai}</h4>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: activeDept.colorStr }}>📋 {activeDept.name} 보고서</h3>
                {activeDept.id === 'engineering' && aiReply && (
                  <button onClick={() => setShowGamePreview(true)} style={{ padding: '4px 12px', backgroundColor: '#4cd137', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🎮 프로토타입 실행</button>
                )}
              </div>
              <div style={{ flex: 1, backgroundColor: '#0f0f12', padding: '15px', border: '1px solid #2a2a35', borderRadius: '4px', marginBottom: '15px', overflow: 'auto' }}>
                {aiReply ? (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', color: '#e1e1e6', lineHeight: '1.6', fontFamily: 'monospace' }}>{aiReply}</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><p style={{ color: '#555' }}>지시를 기다리고 있습니다...</p></div>
                )}
              </div>

              {/* [전략기획부] 초보자용 가이드 */}
              {activeDept.id === 'strategy' && showSuggestions && !aiReply && (
                <div style={{ flexShrink: 0, marginBottom: '15px', padding: '10px', backgroundColor: '#1a1a20', borderRadius: '4px', border: '1px solid #00a8ff' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#00a8ff', fontSize: '12px' }}>💡 게임 기획이 처음이신가요? (예시 선택)</h5>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {STRATEGY_SUGGESTIONS.map((suggestion, idx) => (
                      <button key={idx} onClick={() => applyStrategyTemplate(suggestion.prompt)} style={{ padding: '6px 10px', fontSize: '11px', backgroundColor: '#333', color: '#fff', border: '1px solid #00a8ff', borderRadius: '4px', cursor: 'pointer' }}>{suggestion.name}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* [기술구현부] 장르 템플릿 제안 */}
              {activeDept.id === 'engineering' && showSuggestions && (
                <div style={{ flexShrink: 0, marginBottom: '15px', padding: '10px', backgroundColor: '#1a1a20', borderRadius: '4px', border: '1px solid #4cd137' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#4cd137', fontSize: '12px' }}>🛠️ 게임 기초 템플릿 제안 (빠른 시작)</h5>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {Object.entries(GENRE_TEMPLATES).map(([key, template]) => (
                      <button key={key} onClick={() => applyEngineeringTemplate(key)} style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#333', color: '#fff', border: '1px solid #4cd137', borderRadius: '4px', whiteSpace: 'nowrap', cursor: 'pointer' }}>{template.name} 적용</button>
                    ))}
                  </div>
                </div>
              )}

              {activeDept.id === 'content' && extractedPrompts.length > 0 && (
                <div style={{ flexShrink: 0, marginBottom: '15px', padding: '10px', backgroundColor: '#1a1a20', borderRadius: '4px', border: '1px solid #e84118' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#e84118', fontSize: '12px' }}>✨ 제안된 에셋 추출 결과</h5>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {extractedPrompts.map((item, idx) => (
                      <button key={idx} onClick={() => handleGenerateImage(item.prompt, item.category)} disabled={imgLoading} style={{ padding: '4px 12px', fontSize: '11px', backgroundColor: '#333', color: '#fff', border: '1px solid #444', borderRadius: '15px', whiteSpace: 'nowrap', cursor: 'pointer', opacity: imgLoading ? 0.5 : 1 }}>
                        {item.category === '캐릭터' ? '👤' : item.category === '배경' ? '🖼️' : '📦'} [{item.category}] {item.label}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {imgLoading && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 160, borderRadius: '12px' }}>
                  <div style={{ width: '50px', height: '50px', border: '5px solid #333', borderTop: '5px solid #e84118', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
                  <h3 style={{ color: '#e84118' }}>🎨 AI가 에셋을 열심히 그리는 중입니다...</h3>
                </div>
              )}
              {previewImages.length > 0 && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#16161a', border: '2px solid #9c88ff', padding: '20px', borderRadius: '12px', zIndex: 150, textAlign: 'center', boxShadow: '0 0 50px rgba(0,0,0,1)' }}>
                  <h4 style={{ color: '#9c88ff' }}>🎨 생성된 에셋 시안</h4>
                  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
                    {previewImages.map((img, idx) => (
                      <div key={idx}>
                        <div style={{ width: '150px', height: '150px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>
                          <img src={img.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <button onClick={() => applySelectedImage(img)} style={{ padding: '6px 15px', backgroundColor: '#9c88ff', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>이걸로 적용</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPreviewImages([])} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>취소</button>
                </div>
              )}
              <div style={{ flexShrink: 0, marginBottom: '15px' }}>
                <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} onKeyDown={stopPropagation} placeholder="추가 지시사항을 입력하세요..." style={{ width: '100%', height: '80px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', padding: '10px', boxSizing: 'border-box', resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', flexShrink: 0 }}>
                <button onClick={handleClose} style={{ padding: '8px 20px', backgroundColor: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px' }}>닫기</button>
                <button onClick={handleApprove} disabled={loading} style={{ padding: '8px 25px', backgroundColor: activeDept.colorStr, border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', opacity: loading ? 0.5 : 1 }}>{loading ? "연산 중..." : "지시 완료"}</button>
              </div>
            </div>
          </div>
          {activeDept.id === 'content' && generatedAssets?.length > 0 && (
            <div style={{ position: 'absolute', right: '20px', top: '20px', width: '250px', backgroundColor: '#16161a', border: '1px solid #e84118', borderRadius: '8px', padding: '15px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h4 style={{ color: '#e84118' }}>🖼️ 생성된 에셋</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {generatedAssets.map(asset => (
                  <div key={asset.id} style={{ border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={asset.url} alt={asset.description} style={{ width: '100%', display: 'block' }} />
                    <p style={{ fontSize: '10px', padding: '5px', margin: 0, color: '#aaa' }}>{asset.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
