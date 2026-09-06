# package.json

Uses pnpm 11.25.0. Existing `test` runs Vitest logic tests; `build` type-checks then builds both entries. `test:component` builds and runs the separate-origin Playwright harness. @playwright/test is the only new dependency, required because no browser-test tool was previously installed. PLAYWRIGHT_EXECUTABLE_PATH can select an installed Chromium.
