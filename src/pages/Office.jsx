import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import { useNavigate } from 'react-router-dom';

// 1. Phaser Scene Definition
class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
    this.player = null;
    this.cursors = null;
    this.spaceKey = null;
    this.dialogueText = null;
    this.currentDept = null; // 현재 밟고 있는 부서 정보 저장
    this.reactCallback = null; // React와 통신하기 위한 콜백

    this.departments = [
      { id: 'strategy', name: '1. 전략기획실', color: 0x00a8ff, colorStr: '#00a8ff', x: 50, y: 50, ai: 'Concept & Strategy AI', msg: "🤖 전략기획실: '시장 트렌드를 분석하여 흥행 가능성이 높은 기획안을 준비했습니다.' [Space를 눌러 기획 시작]" },
      { id: 'content', name: '2. 콘텐츠 개발부', color: 0xe84118, colorStr: '#e84118', x: 570, y: 50, ai: 'Creative Content AI', msg: "🤖 콘텐츠 개발부: '시나리오와 아트, 사운드 팀이 창의적인 작업을 대기 중입니다.' [Space를 눌러 에셋 생성]" },
      { id: 'engineering', name: '3. 기술 구현부', color: 0x4cd137, colorStr: '#4cd137', x: 50, y: 380, ai: 'Technical Engineering AI', msg: "🤖 기술 구현부: '최적화된 로직과 HRI 설계를 통해 완벽한 엔진을 구축하겠습니다.' [Space를 눌러 코드 빌드]" },
      { id: 'ops', name: '4. 라이브 운영부', color: 0xfbc531, colorStr: '#fbc531', x: 570, y: 380, ai: 'Live Ops AI', msg: "🤖 라이브 운영부: '유저들과 소통하며 최상의 밸런스를 유지하도록 관리하겠습니다.' [Space를 눌러 밸런싱]" },
      { id: 'analytics', name: '5. 데이터 인사이트 부', color: 0x9c88ff, colorStr: '#9c88ff', x: 310, y: 215, ai: 'Data & Analytics AI', msg: "🤖 데이터 인사이트 부: '모든 지표를 대시보드화하여 다음 업데이트 방향을 보고드립니다.' [Space를 눌러 지표 확인]" },
    ];
  }

  init(data) {
    this.reactCallback = data.onOpenModal; // React 모달 오픈 함수 바인딩
  }

  preload() {
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.add.grid(400, 300, 800, 600, 32, 32, 0x1e1e1e).setOrigin(0.5);

    this.departments.forEach(dept => {
      dept.graphics = this.add.graphics();
      this.drawDeptZone(dept, 0.1); // 기본 상태 투명도 0.1

      this.add.text(dept.x + 10, dept.y + 10, `${dept.name}\n\n[${dept.ai}]`, { 
        font: "bold 13px Arial", 
        fill: dept.colorStr,
        wordWrap: { width: 160 }
      });

      const zone = this.add.zone(dept.x + 90, dept.y + 75, 180, 150);
      this.physics.add.existing(zone, true);
      dept.zone = zone;
    });

    this.dialogueText = this.add.text(400, 560, "회장님, 원하시는 부서로 이동하여 업무를 지시해 주세요.", {
      font: "15px Arial", fill: "#ffffff", backgroundColor: "#000000",
      padding: { x: 20, y: 10 }, align: 'center', fixedWidth: 750
    }).setOrigin(0.5).setAlpha(0.8);

    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [ { key: 'player', frame: 4 } ], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  drawDeptZone(dept, alpha) {
    dept.graphics.clear();
    dept.graphics.fillStyle(dept.color, alpha);
    dept.graphics.fillRect(dept.x, dept.y, 180, 150);
    dept.graphics.lineStyle(2, dept.color, alpha + 0.5);
    dept.graphics.strokeRect(dept.x, dept.y, 180, 150);
  }

  update() {
    if (!this.player || !this.player.body) return;

    // 1. 부서 밟고 있는지 체크 (Overlap 수동 체크로 진입/이탈 완벽 제어)
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
        this.drawDeptZone(this.currentDept, 0.3); // 들어갔을 때 불빛 밝게 (0.3)
        this.dialogueText.setText(this.currentDept.msg);
        this.dialogueText.setBackgroundColor(this.currentDept.colorStr);
      }

      // Space바 누르면 React 모달 팝업 트리거
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.reactCallback) {
        this.reactCallback(this.currentDept);
      }
    } else {
      if (this.currentDept) {
        this.drawDeptZone(this.currentDept, 0.1); // 나오면 다시 흐리게 (0.1)
        this.currentDept = null;
        this.dialogueText.setText("회장님, 원하시는 부서로 이동하여 업무를 지시해 주세요.");
        this.dialogueText.setBackgroundColor("#000000");
      }
    }

    // 2. 부드러운 대각선 8방향 조작 체계
    this.player.setVelocity(0);
    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown) vx = speed;

    if (this.cursors.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown) vy = speed;

    // 대각선 이동 시 속도 정규화 (치우침 방지)
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // 애니메이션 제어
    if (vx < 0) {
      this.player.anims.play('left', true);
    } else if (vx > 0) {
      this.player.anims.play('right', true);
    } else if (vy !== 0) {
      // 위아래 이동 시에는 기존 애니메이션 유지하되 턴 방지
    } else {
      this.player.anims.play('turn');
    }
  }
}

// 2. React Component
export default function Office() {
  const navigate = useNavigate();
  const [activeDept, setActiveDept] = useState(null); // 현재 모달이 켜진 부서 정보

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

    // Phaser가 시작할 때 React 함수를 주입해 줍니다.
    game.scene.start('OfficeScene', {
      onOpenModal: (dept) => {
        setActiveDept(dept); // 특정 부서 모달 열기
      }
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a',
      color: '#fff', fontFamily: 'Arial, sans-serif', position: 'relative'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#00a8ff', letterSpacing: '2px' }}>AGMC HEADQUARTERS</h2>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #333',
            color: '#888', cursor: 'pointer', borderRadius: '4px', transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.borderColor = '#00a8ff'}
          onMouseOut={(e) => e.target.style.borderColor = '#333'}
        >
          Exit to Lobby
        </button>
      </div>

      {/* Phaser Canvas Container */}
      <div id="agmc-office-container" style={{ 
        borderRadius: '12px', overflow: 'hidden', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid #222'
      }}></div>

      <div style={{ marginTop: '15px', color: '#555', fontSize: '12px', textAlign: 'center' }}>
        [회장님 전용 집무실] 방향키로 이동 후, 부서 영역 안에서 <strong>[Spacebar]</strong>를 누르면 업무 지시 창이 열립니다.
      </div>

      {/* 팝업 모달 UI (진짜 결재 서류 같은 느낌 연출) */}
      {activeDept && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#16161a', border: `2px solid ${activeDept.colorStr}`,
            borderRadius: '8px', width: '450px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ marginTop: 0, color: activeDept.colorStr }}>📋 {activeDept.name} 업무 지시서</h3>
            <p style={{ color: '#aaa', fontSize: '14px' }}>담당 AI 사원: <strong>{activeDept.ai}</strong></p>
            <hr style={{ borderColor: '#333', margin: '15px 0' }} />
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888' }}>지시 사항 내용 입력</label>
              <textarea 
                placeholder={`이곳에 ${activeDept.name}에 내릴 명령을 적으십시오...`}
                style={{ width: '100%', height: '100px', backgroundColor: '#222', border: '1px solid #444', color: '#fff', borderRadius: '4px', padding: '10px', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
              <button 
                onClick={() => setActiveDept(null)}
                style={{ padding: '8px 16px', backgroundColor: '#333', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px' }}
              >
                보류 (닫기)
              </button>
              <button 
                onClick={() => {
                  alert(`${activeDept.name}에 지시가 전달되었습니다! (GPT-4o 연동 구역)`);
                  setActiveDept(null);
                }}
                style={{ padding: '8px 16px', backgroundColor: activeDept.colorStr, border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
              >
                결재 및 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
