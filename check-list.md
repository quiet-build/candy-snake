# snake-kids — Production Release Checklist
> Generated 2026-07-11 from the portfolio review. Portfolio summary: ~/projects/check-list.md

**Status**: release-ready — "Candy Snake", a polished classic snake for ages 9–12 (lives, three food types, three power-ups, level progression, obstacles). Feature-complete, well-tested pure logic (41 Vitest tests), kid-friendly redesign done, real Cloudflare Pages pipeline (project `candy-snake`). Remote: `github.com/matwming/candy-snake`.

## Do yourself (human-only)
- [ ] Confirm the `candy-snake` Cloudflare Pages project and repo secrets exist and the first deploy went green.
- [ ] Playtest the difficulty curve with a 9–12-year-old.
- [ ] **Listen on a device to the audio** — commit `aae7db1` replaced the silent placeholders with audible chiptune SFX + BGM (bgm 13 KB, SFX 0.9–2 KB, all now non-zero). Confirm by ear before shipping.

## Decisions needed
- Whether install-to-homescreen matters for the tablet audience (there's no PWA manifest, unlike chess/gomoku) — add one if yes.
- Final call on audio after the listen check.

## Delegate to Claude (automatable)
- [ ] **Resolve the audio doc/asset contradiction**: README and `CLAUDE.md` both still say `public/audio/` "ships silent placeholders — replace with real CC0 SFX before shipping", but commit `aae7db1` already landed audible SFX + BGM. Update the docs to match reality (the human item above is the device listen; this delegable item is fixing the stale docs).
- [ ] Add a PWA manifest if install-to-homescreen is wanted.

## Risks to keep in mind
- The audio doc/asset contradiction is the main risk — shipping with silent audio would badly undercut an otherwise polished game; docs and reality currently disagree.
- Phaser-coupled code (`scenes/`, `ui/`, `SwipeInput.ts`) is deliberately untested, so mobile swipe regressions won't be caught by the 41 unit tests.
