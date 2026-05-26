# POE2 Regex Pal — Project Overview

A public static web tool that generates optimized regex strings for POE2's in-game search bar. Primary use case: vendor shopping while leveling through the acts. One-click copy.

See `plan.md` for the implementation plan and `research/` for the source speedrunner guides.

## Problem

POE2's search bars (vendors, stash, tree) accept regex. Players craft these from guides that encode opaque compressed fragments like `nter's` or `rwh` with no explanation, and hand-maintain them per patch. Tedious, error-prone, and hard to learn.

## Solution

A builder organized as **builds → tabs**:

- A **build** is a loadout (e.g. "EDC Witch") — a collection of tabs.
- A **tab** is one regex for one stage (Act 1…4, "Early Maps", "Bossing", …).
- Within a tab you compose what you're hunting (offense / defense / universal mods) and set a quality floor per category, at a level band.

Clicking a tab **copies its regex to the clipboard and opens it for editing** — so mid-run you just click the stage you're at and paste at the vendor.

## How it works (key insight)

POE affixes have tiers gated by required item level, and each tier has a distinct **name** (e.g. movement speed: `Runner's`→`Sprinter's`→`Stallion's`…). The in-game search matches the item's visible text, which includes both the affix **name** (tier-selective) and the stat **text** (tier-agnostic, e.g. "Movement"). So:

- "any movement speed" → match the shared stat text (`vem`).
- "≥15% movement speed" → match the names of all qualifying tiers.

A solver computes these fragments from real affix data, so it's honest about coverage (the guides' single fragment per act is an approximation).

## Design decisions

- **No false negatives.** Missing a good item is worse than highlighting an extra. The solver never drops coverage for brevity; false positives are acceptable.
- **Match by affix name** (primary), stat text only for the tier-agnostic catch-all.
- **Level band per tab** bounds which affix tiers are obtainable/shown. "Act" buttons are just default tabs with a preset band — nothing special.
- **Per-category floor** is independent (movement "any" but resistances "20%+").
- **Only flat defenses matter** (percent is craftable): flat armour / ES / evasion + 3 hybrids.
- **Compose, don't enumerate.** Offense/defense pickers reconstruct any build, so we don't curate dozens of build presets. A small set of default builds ships; users grow the library by **cloning** or building **from scratch**, and share whole builds.
- **Solver runs at runtime** in the browser, reacting to selections.
- **Static site, no backend.** Affix data is trimmed offline into a bundled JSON. Builds persist in localStorage; export/import as JSON. GitHub Pages deployment.
- **250-char budget** (POE 0.5 raised the limit from 50). Generous, so optimization is a fallback, not the core.
- POE 0.5 also enables tier search on **rare** items, not just magic.

## Scope

- **P1 — Vendor search** (this build): builds/tabs, compose + floors + band, computed regex, copy.
- P2 — Stash tab search
- P3 — Player shop search
- P4 — Simulated shop (paste item text, see what a regex catches)

## Data sources

- Game mod data: RePoE Fork at `repoe-fork.github.io/poe2` (`mods.json`, `stat_translations/`, `base_items.json`). Datamined JSON; not realtime — re-pull per patch. See `plan.md` for the adapter.
- Affix fragment knowledge cross-checked against the speedrunner guides in `research/`.

## Stack

- TypeScript (strict)
- @fun-land/fun-web + @fun-land/fun-state + @fun-land/accessor
- @vanilla-extract/css
- Vite + pnpm
- Deploy: GitHub Pages via GitHub Actions
