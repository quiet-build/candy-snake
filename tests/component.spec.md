# component.spec.js

The focused landmark regression requires zero embedded main landmarks and one standalone main. Input helpers target the neutral .game-container; setup-failure injection targets its div creation.

Built component regressions cover ready/play, actual keyboard and touch steering, pause/resume/restart, real game-over score, host typing/native Space, setup-error recovery, game-origin audio, standalone play, widths 900/390/320, ten reconnects and lifetime cleanup. Canvas aria labels are production accessibility state, not test-only state. Lifetime tests first prove an AudioContext was created and observe its closure plus WebGL disposal with animation frames withheld.

The real three-life scene-tick and replay case has a local 45-second budget because advancing its 14.192 seconds of game clock through software rendering can exceed the suite's 30-second default; all control, score, round and replay assertions remain required.

Post-import renderer getContext fault injection proves one AudioContext existed before failed construction, then checks the safe error, audio closure, aborted owned listeners, detached canvas, no premature ready or page errors, and a playable same-element reconnect with clean final removal.
