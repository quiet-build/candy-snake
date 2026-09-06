# mount.ts

`mount(container, ready?, result?)` creates a fresh Phaser session and returns `pause()` and idempotent `dispose()`. Keyboard capture and pointer targets are scoped to the focusable game container; Phaser window input is disabled. Focus leaving the game, window blur and document hiding pause active play. Snake uses the existing PauseScene and XState deep-history resume. Ready follows MenuScene UI creation; result follows GameOverScene creation.

The scene registry owns one audio manager. Session disposal removes native listeners, stops scenes/actors/audio and destroys Phaser through `runtime.ts`. Standalone and component entries share this path.

Mount establishes runtime ownership first in preBoot and catches construction failure itself, since the caller cannot receive a partially constructed session. It aborts listeners and requests failed-boot disposal before rethrowing the original error for the component's safe error event; a cleanup exception is logged without replacing that error.
