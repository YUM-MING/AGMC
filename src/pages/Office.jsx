import { useEffect, useState } from 'react';
import Phaser from 'phaser';
import { useNavigate } from 'react-router-dom';
import { requestAiTask, requestImageGeneration } from '../services/ai';
import { useProjectStore } from '../store/projectStore';

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

    // 배경 그림의 가구 배치에 맞춰 부서 위치 재조정 (가정된 레이아웃)
    this.departments = [
      { id: 'strategy', name: '전략기획실', color: 0x00a8ff, colorStr: '#00a8ff', x: 150, y: 220, ai: 'Concept Specialist' },
      { id: 'content', name: '콘텐츠개발부', color: 0xe84118, colorStr: '#e84118', x: 650, y: 220, ai: 'Visual & Story Director' },
      { id: 'engineering', name: '기술구현부', color: 0x4cd137, colorStr: '#4cd137', x: 150, y: 450, ai: 'Lead Developer' },
      { id: 'ops', name: '라이브운영부', color: 0xfbc531, colorStr: '#fbc531', x: 650, y: 450, ai: 'Balance Optimizer' },
      { id: 'analytics', name: '데이터인사이트부', color: 0x9c88ff, colorStr: '#9c88ff', x: 400, y: 350, ai: 'Fun Factor Analyst' },
    ];
  }

  init(data) {
    this.reactCallback = data.onOpenModal; 
    this.projectData = data.projectData;
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
    if (!this.projectData?.strategy) return "반갑습니다 회장님! 먼저 [전략기획실]에 방문하여 게임의 핵심 컨셉을 정해주세요.";
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

export default function Office() {
  const navigate = useNavigate();
  const { projectName, isProjectStarted, projectData, startProject, updateDeptData, resetProject, generatedAssets, addAsset } = useProjectStore();
  
  const [activeDept, setActiveDept] = useState(null); 
  const [instruction, setInstruction] = useState(""); 
  const [aiReply, setAiReply] = useState("");         
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [showGamePreview, setShowGamePreview] = useState(false);

  useEffect(() => {
    // 모달이 켜지면 Phaser의 키보드 입력을 무시하도록 처리
    if (window.phaserGame?.input?.keyboard) {
      window.phaserGame.input.keyboard.enabled = !(activeDept || showGamePreview || !isProjectStarted);
    }
  }, [activeDept, showGamePreview, isProjectStarted]);

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
      onOpenModal: (dept) => {
        setActiveDept(dept);
        setInstruction("");
        // useProjectStore.getState()를 사용하여 최신 데이터를 가져옴
        const latestProjectData = useProjectStore.getState().projectData;
        setAiReply(latestProjectData[dept.id] || "");
      }
    });

    return () => {
      game.destroy(true);
      window.phaserGame = null;
    };
  }, []); // 빈 배열로 설정하여 한 번만 생성되도록 함

  const handleApprove = async () => {
    if (!instruction.trim()) return alert("지시 내용을 입력하세요.");
    setLoading(true);

    try {
      const fullState = { projectName, projectData };
      const reply = await requestAiTask(activeDept.id, instruction, fullState);
      setAiReply(reply);
      updateDeptData(activeDept.id, reply);
    } catch {
      alert("AI 사원이 업무 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!instruction.trim()) return alert("이미지 생성을 위한 설명을 입력하세요.");
    setImgLoading(true);

    try {
      const url = await requestImageGeneration(instruction);
      const newAsset = { id: Date.now(), url, description: instruction };
      addAsset(newAsset);
      setAiReply(`🎨 이미지가 생성되었습니다!\n\n설명: ${instruction}\nURL: ${url}`);
    } catch (error) {
      console.error(error);
      alert("이미지 생성에 실패했습니다: " + (error.message || "알 수 없는 오류"));
    } finally {
      setImgLoading(false);
    }
  };

  const handleClose = () => {
    setActiveDept(null);
    setInstruction("");
    setAiReply("");
  };

  const handleReset = () => {
    if (confirm("정말로 모든 프로젝트 데이터를 삭제하고 초기화하시겠습니까?")) {
      resetProject();
    }
  };

  const handleStartProject = () => {
    if (!newProjectName.trim()) return alert("프로젝트 이름을 입력하세요.");
    startProject(newProjectName);
    setNewProjectName("");
  };

  // 키보드 이벤트 버블링 방지 헬퍼
  const stopPropagation = (e) => e.stopPropagation();

  // 엔지니어링 코드에서 순수 HTML만 추출하는 헬퍼 함수
  const getExecutableCode = () => {
    const code = projectData.engineering;
    if (!code) return "";
    
    // AI가 작성한 순수 Javascript (MainScene 클래스)만 추출
    const match = code.match(/```javascript\n?([\s\S]*?)```/) || code.match(/```js\n?([\s\S]*?)```/) || code.match(/```([\s\S]*?)```/);
    const jsCode = match ? match[1].trim() : code;

    // 프론트엔드에 미리 심어둔 베이스 프레임워크 (토큰 절약의 핵심)
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AGMC Prototype</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js"></script>
        <style>
          body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; color: white; font-family: sans-serif; }
          canvas { box-shadow: 0 0 20px rgba(76,209,55,0.5); border-radius: 8px; }
        </style>
      </head>
      <body>
        <div id="game-container"></div>
        <script>
          // --- AI Generated Game Logic ---
          try {
            ${jsCode}
          } catch(e) {
            console.error("AI 코드 파싱 에러:", e);
            document.body.innerHTML = "<h2>게임 로직 오류가 발생했습니다. 기술구현부에 수정을 요청하세요.</h2><p>" + e.message + "</p>";
          }

          // --- Pre-defined Game Framework ---
          window.onload = () => {
            if (typeof MainScene === 'undefined') {
              document.getElementById('game-container').innerHTML = '<h2>MainScene 클래스가 정의되지 않았습니다.</h2>';
              return;
            }
            
            const config = {
              type: Phaser.AUTO,
              width: 800,
              height: 600,
              parent: 'game-container',
              physics: {
                default: 'arcade',
                arcade: { gravity: { y: 300 }, debug: false }
              },
              scene: MainScene
            };
            new Phaser.Game(config);
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#00a8ff', letterSpacing: '2px' }}>AGMC HQ</h2>
          {isProjectStarted && (
            <div style={{ padding: '4px 12px', border: '1px solid #4cd137', borderRadius: '4px', color: '#4cd137', fontSize: '13px', fontWeight: 'bold' }}>
              PROJ: {projectName}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {projectData.engineering && (
            <button 
              onClick={() => setShowGamePreview(true)} 
              style={{ padding: '6px 12px', backgroundColor: '#4cd137', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', boxShadow: '0 0 10px rgba(76,209,55,0.4)' }}
            >
              🎮 게임 플레이
            </button>
          )}
          <button 
            onClick={() => {
              const data = JSON.stringify({ projectName, projectData }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${projectName}_backup.json`;
              a.click();
              URL.revokeObjectURL(url);
            }} 
            style={{ padding: '6px 12px', background: 'none', border: '1px solid #00a8ff', color: '#00a8ff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            EXPORT
          </button>
          <button 
            onClick={() => alert('프로젝트가 브라우저에 자동 저장되었습니다.')} 
            style={{ padding: '6px 12px', background: 'none', border: '1px solid #4cd137', color: '#4cd137', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            SAVE
          </button>
          <button onClick={handleReset} style={{ padding: '6px 12px', background: 'none', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            RESET
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '6px 12px', background: 'none', border: '1px solid #333', color: '#888', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            EXIT
          </button>
        </div>
      </div>

      <div id="agmc-office-container" style={{ 
        borderRadius: '12px', overflow: 'hidden', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid #222'
      }}></div>

      {/* 게임 실행 프리뷰 모달 */}
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
            style={{ width: '800px', height: '600px', border: '2px solid #4cd137', borderRadius: '8px', backgroundColor: '#fff' }} 
            sandbox="allow-scripts allow-same-origin"
            title="Game Preview"
          />
          <p style={{ marginTop: '10px', color: '#888', fontSize: '12px' }}>
            * 게임 플레이 중에는 마우스로 게임 화면을 한 번 클릭해야 키보드 조작이 가능합니다.
          </p>
        </div>
      )}

      {!isProjectStarted && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: '#16161a', border: '2px solid #00a8ff', borderRadius: '12px', width: '450px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#00a8ff', marginTop: 0, width: '100%' }}>🏢 프로젝트 시작</h2>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '30px', width: '100%' }}>새로운 게임 프로젝트의 이름을 지어주세요.</p>
            <input 
              type="text" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={stopPropagation}
              placeholder="프로젝트 이름 입력..."
              style={{ width: '100%', padding: '15px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', marginBottom: '25px', textAlign: 'center', fontSize: '18px', boxSizing: 'border-box' }}
            />
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
            
            {/* 좌측 캐릭터 프로필 */}
            <div style={{ width: '200px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '200px', height: '200px', backgroundColor: '#000', borderRadius: '8px', border: `1px solid ${activeDept.colorStr}`, marginBottom: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <img src={DEPT_ASSETS[activeDept.id].path} alt={activeDept.ai} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ margin: '0', color: activeDept.colorStr, fontSize: '15px' }}>{activeDept.ai}</h4>
            </div>

            {/* 우측 업무 영역 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <h3 style={{ marginTop: 0, color: activeDept.colorStr, flexShrink: 0 }}>📋 {activeDept.name} 보고서</h3>
              
              {/* 보고서 출력창 (유동적 크기 할당) */}
              <div style={{ flex: 1, backgroundColor: '#0f0f12', padding: '15px', border: '1px solid #2a2a35', borderRadius: '4px', marginBottom: '15px', overflowY: 'auto', minHeight: '150px' }}>
                {aiReply ? (
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#e1e1e6', lineHeight: '1.6', fontFamily: 'monospace' }}>
                    {aiReply}
                  </div>
                ) : (
                  <p style={{ color: '#555', textAlign: 'center', marginTop: '50px' }}>지시를 기다리고 있습니다...</p>
                )}
              </div>

              {/* 지시사항 입력창 (고정 크기) */}
              <div style={{ flexShrink: 0, marginBottom: '15px' }}>
                <textarea 
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={stopPropagation}
                  placeholder="추가 지시사항을 입력하세요..."
                  style={{ width: '100%', height: '80px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', padding: '10px', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>

              {/* 하단 버튼 영역 */}
              <div style={{ display: 'flex', justifyContent: 'end', gap: '10px', flexShrink: 0 }}>
                <button onClick={handleClose} style={{ padding: '8px 20px', backgroundColor: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px' }}>닫기</button>
                {activeDept.id === 'content' && (
                  <button 
                    onClick={handleGenerateImage}
                    disabled={imgLoading}
                    style={{ padding: '8px 20px', backgroundColor: '#9c88ff', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', opacity: imgLoading ? 0.5 : 1 }}
                  >
                    {imgLoading ? "그리는 중..." : "이미지 생성"}
                  </button>
                )}
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  style={{ padding: '8px 25px', backgroundColor: activeDept.colorStr, border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? "연산 중..." : "지시 완료"}
                </button>
              </div>
            </div>

          </div>

          {/* 생성된 에셋 갤러리 (콘텐츠 개발부에서만 표시) */}
          {activeDept.id === 'content' && generatedAssets?.length > 0 && (
            <div style={{ position: 'absolute', right: '20px', top: '20px', width: '250px', backgroundColor: '#16161a', border: '1px solid #e84118', borderRadius: '8px', padding: '15px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#e84118' }}>🖼️ 생성된 에셋</h4>
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
