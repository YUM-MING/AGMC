import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { useNavigate } from 'react-router-dom';

// 1. Phaser Scene Definition
class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
    this.player = null;
    this.cursors = null;
    this.dialogueText = null;
    this.departments = [
      { 
        id: 'strategy', 
        name: '1. 전략기획실', 
        color: 0x00a8ff, 
        colorStr: '#00a8ff', 
        x: 50, y: 50, 
        ai: 'Concept & Strategy AI',
        msg: "🤖 전략기획실: '회장님, 시장 트렌드를 분석하여 흥행 가능성이 높은 기획안을 준비했습니다.'"
      },
      { 
        id: 'content', 
        name: '2. 콘텐츠 개발부', 
        color: 0xe84118, 
        colorStr: '#e84118', 
        x: 570, y: 50, 
        ai: 'Creative Content AI',
        msg: "🤖 콘텐츠 개발부: '시나리오와 아트, 사운드 팀이 창의적인 작업을 대기 중입니다.'"
      },
      { 
        id: 'engineering', 
        name: '3. 기술 구현부', 
        color: 0x4cd137, 
        colorStr: '#4cd137', 
        x: 50, y: 380, 
        ai: 'Technical Engineering AI',
        msg: "🤖 기술 구현부: '최적화된 로직과 HRI 설계를 통해 완벽한 엔진을 구축하겠습니다.'"
      },
      { 
        id: 'ops', 
        name: '4. 라이브 운영부', 
        color: 0xfbc531, 
        colorStr: '#fbc531', 
        x: 570, y: 380, 
        ai: 'Live Ops AI',
        msg: "🤖 라이브 운영부: '유저들과 소통하며 최상의 밸런스를 유지하도록 관리하겠습니다.'"
      },
      { 
        id: 'analytics', 
        name: '5. 데이터 인사이트 부', 
        color: 0x9c88ff, 
        colorStr: '#9c88ff', 
        x: 310, y: 215, 
        ai: 'Data & Analytics AI',
        msg: "🤖 데이터 인사이트 부: '모든 지표를 대시보드화하여 다음 업데이트 방향을 보고드립니다.'"
      },
    ];
  }

  preload() {
    this.load.spritesheet('player', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    // Background Grid
    this.add.grid(400, 300, 800, 600, 32, 32, 0x1e1e1e).setOrigin(0.5);

    // Create Department Zones
    this.departments.forEach(dept => {
      const graphics = this.add.graphics();
      graphics.fillStyle(dept.color, 0.1);
      graphics.fillRect(dept.x, dept.y, 180, 150);
      graphics.lineStyle(2, dept.color, 0.8);
      graphics.strokeRect(dept.x, dept.y, 180, 150);

      this.add.text(dept.x + 10, dept.y + 10, `${dept.name}\n\n[${dept.ai}]`, { 
        font: "bold 13px Arial", 
        fill: dept.colorStr,
        wordWrap: { width: 160 }
      });

      const zone = this.add.zone(dept.x + 90, dept.y + 75, 180, 150);
      this.physics.add.existing(zone, true);
      
      dept.zone = zone;
    });

    // Dialogue UI
    this.dialogueText = this.add.text(400, 560, "회장님, 원하시는 부서로 이동하여 업무를 지시해 주세요.", {
      font: "15px Arial",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
      align: 'center',
      fixedWidth: 750
    }).setOrigin(0.5).setAlpha(0.8);

    // Player
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // Animations
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [ { key: 'player', frame: 4 } ],
      frameRate: 20
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    // Interaction Overlap
    this.departments.forEach(dept => {
      this.physics.add.overlap(this.player, dept.zone, () => {
        this.updateDialogue(dept.msg, dept.colorStr);
      }, null, this);
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  updateDialogue(text, colorStr) {
    this.dialogueText.setText(text);
    this.dialogueText.setBackgroundColor(colorStr);
  }

  update() {
    if (!this.player || !this.player.body) return;

    this.player.setVelocity(0);
    const speed = 200;

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

    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.anims.play('turn');
    }
  }
}

// 2. React Component
export default function Office() {
  const navigate = useNavigate();

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

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#00a8ff', letterSpacing: '2px' }}>AGMC HEADQUARTERS</h2>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #333',
            color: '#888',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.borderColor = '#00a8ff'}
          onMouseOut={(e) => e.target.style.borderColor = '#333'}
        >
          Exit to Lobby
        </button>
      </div>
      <div id="agmc-office-container" style={{ 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        border: '1px solid #222'
      }}></div>
      <div style={{ marginTop: '15px', color: '#555', fontSize: '12px', textAlign: 'center' }}>
        [회장님 전용 집무실] 방향키를 사용하여 아바타를 이동하고 각 부서의 보고를 확인하세요.
      </div>
    </div>
  );
}