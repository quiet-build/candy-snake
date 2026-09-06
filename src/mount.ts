import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { createAudioManager } from './audio/AudioManager';
import { ownRuntime, SessionGame } from './runtime';

export function mount(container: HTMLElement, ready = () => {}, result = (_detail: { mode: string; score: number }) => {}) {
  const listeners = new AbortController();
  const width = Math.min(container.clientWidth || 720, 720);
  const height = Math.min(container.clientHeight || 820, 820);
  container.tabIndex = 0;
  container.setAttribute('aria-label', 'Candy Snake. Space to play, arrows or WASD to steer, Escape to pause.');
  let disposeRuntime = () => {};
  let disposed = false;
  const game = new SessionGame({
    type: Phaser.AUTO, parent: container, width, height, transparent: true, autoFocus: false,
    input: { windowEvents: false, keyboard: { target: container, capture: [32, 27, 37, 38, 39, 40, 65, 68, 83, 87] }, mouse: { target: container }, touch: { target: container } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    callbacks: { preBoot(game) {
      game.registry.set('audio', createAudioManager());
      disposeRuntime = ownRuntime(game, container);
      game.events.once('pma-ui-ready', () => { if (!disposed) ready(); });
      game.events.on('pma-result', (detail: { mode: string; score: number }) => { if (!disposed) result(detail); });
      if (disposed) disposeRuntime();
    } },
    scene: [BootScene, MenuScene, GameScene, PauseScene, GameOverScene]
  });
  const pause = () => {
    if (disposed) return;
    if (game.scene.isActive('GameScene')) (game.scene.getScene('GameScene') as GameScene).pauseGame();
    game.sound?.pauseAll();
  };
  container.addEventListener('pointerdown', () => { container.focus({ preventScroll: true }); game.sound?.resumeAll(); }, { signal: listeners.signal });
  container.addEventListener('keydown', () => game.sound?.resumeAll(), { signal: listeners.signal });
  container.addEventListener('focusout', event => {
    if (!container.contains(event.relatedTarget as Node | null)) pause();
  }, { signal: listeners.signal });
  window.addEventListener('blur', pause, { signal: listeners.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }, { signal: listeners.signal });
  return { pause, dispose() {
    if (disposed) return;
    disposed = true; listeners.abort(); disposeRuntime();
  } };
}
