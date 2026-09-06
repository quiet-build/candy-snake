# GameScene.ts

Owns the existing tick loop and XState actor. Public `pauseGame()` lets the shared mount enter the existing deep-history pause flow; `resumeFromPause()` restores the recorded state. Audio is session-owned. Scene shutdown stops the actor and native visibility/swipe listeners. Canvas labels reflect play, current score and the actual committed movement direction. Every new run still resets all per-run state in create().
