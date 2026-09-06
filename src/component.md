# component.ts

Registers `pma-candy-snake` with open Shadow DOM and natural, responsive canvas height. Connection creates a fresh session; removal disposes it; reconnection works. Public `pause(): void` exposes the existing resumable pause scene.

`pma-ready`, `pma-error` and `pma-round-ended` bubble and compose. Details include `gameId: 'candy-snake'`; initialization errors use the stable message `Unable to start game. Please try again.`; real game-over results include `mode: 'classic'` and numeric `score`. Raw diagnostic errors stay in the console. No service worker registration.
