import Phaser from 'phaser';
import { THEME } from '../theme';
import { loadHighScore } from '../storage';
import type { createAudioManager } from '../audio/AudioManager';
import { makePillowButton } from '../ui/PillowButton';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  private get audio(): ReturnType<typeof createAudioManager> { return this.registry.get('audio'); }

  create() {
    const { width, height } = this.scale;

    this.drawBackground(width, height);
    this.drawDriftingCandy(width, height);

    const titleSize = width < 520 ? 52 : 72;

    // Title — playful display type, calmed by the forest-and-cream palette
    const title = this.add.text(width / 2, height * 0.28, 'Candy Snake', {
      fontFamily: THEME.font.display,
      fontSize: `${titleSize}px`,
      fontStyle: '700',
      color: '#174e3b',
      stroke: '#fffaf0',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 5, color: '#563c2d24', blur: 8, fill: true }
    }).setOrigin(0.5);
    this.tweens.add({
      targets: title,
      y: height * 0.28 - 8,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Snake mascot beneath the title
    const mascotY = height * 0.42;
    const mascot = this.add.container(width / 2, mascotY);
    const positions = [-72, -48, -24, 0, 24]; // tail to head, x offsets
    positions.forEach((dx, i) => {
      const isHead = i === positions.length - 1;
      const radius = isHead ? 22 : 18 - i * 0.5;
      const t = i / (positions.length - 1);
      const r = Math.round(0x2b + (0x3f - 0x2b) * t);
      const g = Math.round(0xa8 + (0xd1 - 0xa8) * t);
      const b = Math.round(0x55 + (0x6c - 0x55) * t);
      const color = (r << 16) | (g << 8) | b;
      const segY = Math.sin((i / positions.length) * Math.PI) * -8;
      const seg = this.add.circle(dx, segY, radius, color);
      mascot.add(seg);
      if (isHead) {
        const lEye = this.add.circle(dx + 8, segY - 4, 3, 0x1a1a1a);
        const rEye = this.add.circle(dx + 8, segY + 4, 3, 0x1a1a1a);
        const lBlush = this.add.circle(dx + 14, segY + 8, 3, THEME.colors.blush, 0.4);
        const rBlush = this.add.circle(dx + 4, segY + 8, 3, THEME.colors.blush, 0.4);
        mascot.add([lEye, rEye, lBlush, rBlush]);
      }
    });
    // Idle wiggle
    this.tweens.add({
      targets: mascot,
      angle: { from: -3, to: 3 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Best-score ribbon (only if > 0)
    const hs = loadHighScore();
    if (hs > 0) {
      const ribbon = this.add.container(width / 2, height * 0.55);
      const bg = this.add.graphics();
      bg.fillStyle(0xf1d49a, 1);
      bg.fillRoundedRect(-110, -22, 220, 44, 22);
      bg.lineStyle(2, 0xc59b50, 1);
      bg.strokeRoundedRect(-110, -22, 220, 44, 22);
      const txt = this.add.text(0, 0, `🏆  Best  ${hs}`, {
        fontFamily: THEME.font.display,
        fontSize: '22px',
        fontStyle: '700',
        color: '#563c2d'
      }).setOrigin(0.5);
      ribbon.add([bg, txt]);
    } else {
      this.add.text(width / 2, height * 0.55, 'Tap PLAY to start', {
        fontFamily: THEME.font.body,
        fontSize: '18px',
        fontStyle: '600',
        color: '#667064'
      }).setOrigin(0.5);
    }

    // PLAY button — pillow style with breathing
    const startGame = () => this.scene.start('GameScene');
    const playBtn = makePillowButton(this, width / 2, height * 0.7, {
      width: 240,
      height: 76,
      label: '▶  PLAY',
      color: 'green',
      breathing: true,
      onClick: startGame
    });
    void playBtn;
    this.input.keyboard?.on('keydown-SPACE', startGame);

    // Audio unlock & sound toggle
    this.audio.setGame(this.game);
    const unlock = () => this.audio.unlock(this);
    this.input.once('pointerdown', unlock);
    this.input.keyboard?.on('keydown', unlock);

    const toggle = this.add.container(34, 34);
    const toggleBg = this.add.graphics();
    const drawToggle = () => {
      toggleBg.clear();
      toggleBg.fillStyle(0xc8cdbd, 1);
      toggleBg.fillCircle(0, 5, 24);
      toggleBg.fillStyle(0xfffaf0, 1);
      toggleBg.fillCircle(0, 0, 24);
    };
    drawToggle();
    const toggleText = this.add.text(0, 0, this.audio.isOn() ? '🔊' : '🔇', {
      fontSize: '24px'
    }).setOrigin(0.5);
    toggle.add([toggleBg, toggleText]);
    const toggleHit = this.add.zone(0, 0, 56, 56).setInteractive({ useHandCursor: true });
    toggle.add(toggleHit);
    toggleHit.on('pointerdown', () => {
      const newState = !this.audio.isOn();
      this.audio.setOn(newState);
      unlock();
      toggleText.setText(this.audio.isOn() ? '🔊' : '🔇');
      this.tweens.add({ targets: toggle, scale: 0.92, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
    });

    // Hint at bottom
    this.add.text(width / 2, height - 24, 'Arrow keys / WASD on desktop · swipe on touch', {
      fontFamily: THEME.font.body,
      fontSize: '13px',
      fontStyle: '400',
      color: '#667064'
    }).setOrigin(0.5).setAlpha(0.9);
    this.game.canvas.setAttribute('role', 'img');
    this.game.canvas.setAttribute('aria-label', 'Candy Snake. Press Space or tap Play to start.');
    this.game.events.emit('pma-ui-ready');
  }

  /** Warm paper background with restrained tinted fields. */
  private drawBackground(width: number, height: number) {
    const bg = this.add.graphics();
    bg.fillStyle(0xf5f2e8, 1).fillRect(0, 0, width, height);
    bg.fillStyle(0xc7b4dc, 0.12).fillRect(0, height * 0.38, width, height * 0.62);
    bg.fillStyle(0xefb097, 0.1).fillRect(0, 0, width, height * 0.44);
  }

  /** Decorative candy / cloud shapes drifting horizontally for depth. */
  private drawDriftingCandy(width: number, height: number) {
    const shapes = [
      { y: height * 0.12, r: 28, color: 0x9dc3a5, alpha: 0.24, speed: 60 },
      { y: height * 0.22, r: 20, color: 0xc7b4dc, alpha: 0.22, speed: 80 },
      { y: height * 0.66, r: 24, color: 0xf1d49a, alpha: 0.25, speed: 50 },
      { y: height * 0.82, r: 18, color: 0x9dc3a5, alpha: 0.22, speed: 70 },
      { y: height * 0.92, r: 30, color: 0xefb097, alpha: 0.2, speed: 55 }
    ];
    for (const s of shapes) {
      const startX = -s.r - Math.random() * width;
      const blob = this.add.circle(startX, s.y, s.r, s.color, s.alpha);
      this.tweens.add({
        targets: blob,
        x: width + s.r,
        duration: s.speed * 1000 / (width / 200),
        repeat: -1,
        ease: 'Linear'
      });
    }
  }
}
