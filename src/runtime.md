# runtime.ts

Phaser 3.90 lifetime boundary. `SessionGame.start()` temporarily captures Phaser's document visibility listener during the synchronous `super.start()` call, restores document.addEventListener and pre-existing window focus/blur handlers in `finally`, then removes Phaser's listener. Session-owned listeners supply pause behavior instead.

`ownRuntime()` replaces Phaser's body-wide audio unlock with abortable container gesture listeners. The pending audio promise checks disposal before setting Phaser's documented-in-source `unlocked` flag. Disposal stops active/paused scenes and input, requests game destruction and completes its destruction step without depending on another animation frame.

If synchronous construction fails before SceneManager boots, the idempotent disposer emits DESTROY once for constructor-owned sound/cache cleanup, releases any completed renderer and canvas, and destroys the time step immediately. Normal Game destruction cannot run there: the system scene does not exist, and a failed renderer boot never reaches READY. Successful pending boot still uses the existing READY/public-step path.

Recheck installed Phaser `core/Game.js`, `core/VisibilityHandler.js`, `sound/BaseSoundManager.js` and `sound/webaudio/WebAudioSoundManager.js` when upgrading. Keep the document-method interception entirely synchronous. Component tests verify preserved host handlers, detached listener counts, audio closure, stopped draws and teardown with animation frames withheld.
