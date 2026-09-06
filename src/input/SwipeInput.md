# SwipeInput.ts

Feeds the existing DirectionBuffer from canvas-owned PointerEvents. Converts client coordinates into logical canvas coordinates, keeps the 20-pixel threshold and chained-turn re-arming, ignores secondary pointers, clears gestures when paused/cancelled, and aborts listeners on scene shutdown. Pointer capture retains a swipe outside the canvas boundary.

This native boundary avoids Phaser 3.90's touch-move use of document.elementFromPoint, which returns the custom-element host inside Shadow DOM. The component browser test uses actual Chromium touch events and asserts the committed direction. Standalone uses the same adapter.
