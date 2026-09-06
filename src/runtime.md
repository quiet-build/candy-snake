# runtime.ts

Phaser 3.90 lifetime boundary. `SessionGame.start()` temporarily captures Phaser's document visibility listener during the synchronous `super.start()` call, restores document.addEventListener and pre-existing window focus/blur handlers in `finally`, then removes Phaser's listener. Session-owned listeners supply pause behavior instead.

`ownRuntime()` replaces Phaser's body-wide audio unlock with abortable container gesture listeners. The pending audio promise checks disposal before setting Phaser's documented-in-source `unlocked` flag. Disposal stops active/paused scenes and input, requests game destruction and completes its destruction step without depending on another animation frame.

Recheck installed Phaser `core/Game.js`, `core/VisibilityHandler.js`, `sound/BaseSoundManager.js` and `sound/webaudio/WebAudioSoundManager.js` when upgrading. Keep the document-method interception entirely synchronous. Component tests verify preserved host handlers, detached listener counts, audio closure, stopped draws and teardown with animation frames withheld.
