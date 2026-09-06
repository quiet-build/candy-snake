# component.spec.js

Built component regressions cover ready/play, actual keyboard and touch steering, pause/resume/restart, real game-over score, host typing/native Space, setup-error recovery, game-origin audio, standalone play, widths 900/390/320, ten reconnects and lifetime cleanup. Canvas aria labels are production accessibility state, not test-only state. Lifetime tests first prove an AudioContext was created and observe its closure plus WebGL disposal with animation frames withheld.
