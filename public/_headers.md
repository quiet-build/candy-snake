# Component response headers

Wildcard CORS covers the stable module and all game-origin JS, styles, fonts, audio and worker/WASM dependencies. Revalidation prevents stale component.js reuse without a conditional request. Retention preserves immutable dependencies; these headers apply to the current build.
