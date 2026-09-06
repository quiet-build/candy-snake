import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    this.load.setBaseURL(new URL(/* @vite-ignore */ '../audio/', import.meta.url).href);
    this.load.audio('chomp', 'chomp.mp3');
    this.load.audio('pop', 'pop.mp3');
    this.load.audio('chime', 'chime.mp3');
    this.load.audio('power-up', 'power-up.mp3');
    this.load.audio('level-up', 'level-up.mp3');
    this.load.audio('oof', 'oof.mp3');
    this.load.audio('game-over', 'game-over.mp3');
    this.load.audio('bgm', 'bgm.mp3');
  }
  create() { this.scene.start('MenuScene'); }
}
