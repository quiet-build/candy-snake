import Phaser from 'phaser';

// Phaser 3.90 start() installs process-wide visibility handlers without cleanup.
// Intercept only its synchronous start call and immediately restore the host.
export class SessionGame extends Phaser.Game {
  protected override start() {
    const blur = window.onblur, focus = window.onfocus;
    const add = document.addEventListener;
    const owned: Array<() => void> = [];
    document.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      add.call(document, type, listener, options);
      if (type === 'visibilitychange') owned.push(() => document.removeEventListener(type, listener, options));
    } as typeof document.addEventListener;
    try { super.start(); } finally {
      document.addEventListener = add;
      window.onblur = blur; window.onfocus = focus;
      for (const remove of owned) remove();
    }
  }
}

export function ownRuntime(game: Phaser.Game, container: HTMLElement) {
  const listeners = new AbortController();
  let disposed = false;
  const sound = game.sound as Phaser.Sound.WebAudioSoundManager;
  if (sound.context) {
    game.events.off(Phaser.Core.Events.BOOT, sound.unlock, sound);
    const unlock = () => {
      if (!disposed && sound.context?.state === 'suspended') {
        void sound.context.resume().then(() => {
          // Phaser consumes this flag in update() to clear its sound lock.
          if (!disposed) Object.assign(sound, { unlocked: true });
        }).catch(() => {});
      }
    };
    container.addEventListener('pointerdown', unlock, { signal: listeners.signal });
    container.addEventListener('keydown', unlock, { signal: listeners.signal });
  }
  return () => {
    disposed = true;
    listeners.abort();
    game.input?.keyboard?.stopListeners();
    game.sound?.stopAll();
    for (const scene of game.scene.getScenes(false)) {
      if (scene.sys.isActive() || scene.sys.isPaused()) game.scene.stop(scene);
    }
    game.destroy(true);
    // Complete the public pending-destroy step after the current callback,
    // even when a hidden document no longer receives animation frames.
    const finish = () => queueMicrotask(() => game.step(performance.now(), 0));
    if (game.isRunning) finish();
    else game.events.once(Phaser.Core.Events.READY, finish);
  };
}
