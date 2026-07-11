# snake-kids — Improvements (UI / UX / design / workflow)
> Generated 2026-07-11 from the portfolio review. Portfolio summary: ~/projects/improvements.md

1. Add an onboarding / first-run "how to play" card in `MenuScene` (swipe/arrows, food values, power-up icons). The redesign is the strongest of the four — extend it here; power-ups (`src/game/PowerUps.ts`) aren't self-explanatory.
2. Add a power-up legend to the HUD. The timer ring exists in `src/ui/HUD.ts`, but the ❄/👻/✨ meanings aren't taught anywhere.
3. Give level-up moments (`LevelBanner.ts`) a brief celebratory sound + speed-up preview so the difficulty jump feels earned, not punishing.
4. On `GameOverScene`, show "new best!" more prominently and offer a one-tap "Play Again" as a big pillow button (reuse `PillowButton.ts`).
5. Telegraph obstacles the first time they appear (L4/6/8/10) with a "watch out!" banner — their sudden arrival can feel abrupt.
