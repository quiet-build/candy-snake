# Component response headers

Wildcard CORS covers the stable module and all game-origin JS, styles, fonts, audio and worker/WASM dependencies. The stable component.js entry adds no-cache so every reuse validates, even if the platform injects a positive max-age. Retention preserves immutable dependencies; these headers apply to the current build.
