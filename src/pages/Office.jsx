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
      { id: 'strategy', name: '전략기획실', color: 0x00a8ff, colorStr: '#00a8ff', x: 100, y: 100, ai: 'GPT-4o' },
      { id: 'content', name: '콘텐츠제작실', color: 0xe84118, colorStr: '#e84118', x: 600, y: 100, ai: 'DALL-E 3' },
      { id: 'engineering', name: '기술개발국', color: 0x4cd137, colorStr: '#4cd137', x: 100, y: 400, ai: 'Claude 3.5' },
      { id: 'ops', name: '운영지원팀', color: 0xfbc531, colorStr: '#fbc531', x: 600, y: 400, ai: 'Gemini 1.5' },
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
      graphics.fillRect(dept.x, dept.y, 180, 120);
      graphics.lineStyle(2, dept.color, 0.8);
      graphics.strokeRect(dept.x, dept.y, 180, 120);

      this.add.text(dept.x + 10, dept.y + 10, `${dept.name}\n(${dept.ai})`, { 
        font: "bold 14px Arial", 
        fill: dept.colorStr
      });

      const zone = this.add.zone(dept.x + 90, dept.y + 60, 180, 120);
      this.physics.add.existing(zone, true);
      
      dept.zone = zone;
    });

    // Dialogue UI
    this.dialogueText = this.add.text(400, 560, "각 부서로 이동하여 AI 팀장님들과 대화하세요.", {
      font: "15px Arial",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
      align: 'center',
      fixedWidth: 700
    }).setOrigin(0.5).setAlpha(0.8);

    // Player
    this.player = this.physics.add.sprite(400, 300, 'player');
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
        this.updateDialogue(`🤖 ${dept.name} AI: '반갑습니다! ${dept.ai}가 업무를 대기 중입니다.'`, dept.colorStr);
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
      backgroundColor: '#111',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#00a8ff' }}>AGMC Headquarters</h2>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #555',
            color: '#ccc',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Exit to Lobby
        </button>
      </div>
      <div id="agmc-office-container" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}></div>
      <div style={{ marginTop: '10px', color: '#888', fontSize: '12px' }}>
        Use Arrow Keys to move your avatar.
      </div>
    </div>
  );
}