# PauseScene.ts

Existing canvas Resume, Restart and Menu controls preserve XState history behavior. Escape resumes and stops propagation so the same key cannot immediately pause the newly resumed GameScene. The canvas accessibility label reports the paused state and available actions.
