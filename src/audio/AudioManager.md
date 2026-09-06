# AudioManager.ts

`createAudioManager()` owns unlock state, BGM reference and sound preference for one Phaser session. The session stores it in the scene registry. Existing game-prefixed sound storage is retained; game disposal releases Phaser sounds and audio context. Public audio files remain the existing silent placeholders: lifetime/network verification does not prove audible sound.
