import Phaser from 'phaser';
import { THEME } from '../theme';
import { makePillowButton } from '../ui/PillowButton';

export class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create() {
    const { width, height } = this.scale;

    // Translucent backdrop — interactive to swallow clicks but not resume
    // (too easy to trigger by accident on touch).
    const bg = this.add.rectangle(0, 0, width, height, 0x1a1a30, 0.55).setOrigin(0).setInteractive();
    bg.on('pointerdown', () => { /* swallow only */ });

    // Card with soft drop shadow effect (two stacked rounded rects)
    const cardWidth = Math.min(340, width - 32);
    const cardLeft = width / 2 - cardWidth / 2;
    const cardShadow = this.add.graphics();
    cardShadow.fillStyle(0x174e3b, 0.2);
    cardShadow.fillRoundedRect(cardLeft, height / 2 - 145, cardWidth, 290, 24);
    const card = this.add.graphics();
    card.fillStyle(0xfffaf0, 1);
    card.fillRoundedRect(cardLeft, height / 2 - 150, cardWidth, 290, 24);
    card.lineStyle(2, 0xc8cdbd, 1);
    card.strokeRoundedRect(cardLeft, height / 2 - 150, cardWidth, 290, 24);
    void cardShadow;

    // Title
    const title = this.add.text(width / 2, height / 2 - 95, 'Paused', {
      fontFamily: THEME.font.display,
      fontSize: '40px',
      fontStyle: '700',
      color: '#174e3b'
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, scale: { from: 0.7, to: 1 }, duration: 250, ease: 'Back.easeOut' });

    // Pause icon (two rounded bars)
    const pauseIcon = this.add.graphics();
    pauseIcon.fillStyle(0x9dc3a5, 0.22);
    pauseIcon.fillCircle(width / 2, height / 2 - 95, 40);
    void pauseIcon;

    // Buttons — pillow style
    const buttonWidth = Math.min(240, cardWidth - 48);
    makePillowButton(this, width / 2, height / 2 - 30, {
      width: buttonWidth, height: 56, label: '▶  Resume', color: 'green', breathing: true,
      onClick: () => this.resumeGame()
    });
    makePillowButton(this, width / 2, height / 2 + 38, {
      width: buttonWidth, height: 56, label: '↺  Restart', color: 'pink',
      onClick: () => { this.scene.stop('PauseScene'); this.scene.stop('GameScene'); this.scene.start('GameScene'); }
    });
    makePillowButton(this, width / 2, height / 2 + 106, {
      width: buttonWidth, height: 56, label: '⌂  Menu', color: 'white',
      onClick: () => { this.scene.stop('PauseScene'); this.scene.stop('GameScene'); this.scene.start('MenuScene'); }
    });

    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
  }

  private resumeGame() {
    const game = this.scene.get('GameScene') as Phaser.Scene & { resumeFromPause?: () => void };
    game.resumeFromPause?.();
    this.scene.stop('PauseScene');
  }
}
