# POE2 Regex Pal — Implementation Plan

This is the dev-driver doc. See `overview.md` for the product framing and `research/` for the source guides.

## Domain model

```
Build  = a named COLLECTION of tabs (a loadout). Persisted + shareable unit.
Tab    = one regex builder config -> produces one regex string.
```

Two-level UI: a **build dropdown** swaps the whole tab collection; **tabs** swap the active builder within it. Clicking a tab copies its regex AND opens it for editing.

### Affix (produced by the adapter, from RePoE)

```ts
type Affix = {
  id: string                      // RePoE key, e.g. "MovementVelocity2"
  name: string                    // affix word, e.g. "Sprinter's" (may be "")
  text: string                    // cleaned stat line, e.g. "15% increased Movement Speed"
  requiredLevel: number           // tier gate; higher tier => higher req
  genType: 'prefix' | 'suffix'
  group: string                   // RePoE affix group, e.g. "MovementVelocity" — the MVP selectable unit
  stats: { id: string; min: number; max: number }[]
}
```

### Builder: two selection axes + thin grouping

A tab is assembled with four buttons:
- `+affix` / `-affix` — include/exclude **affix** concepts. Pick a concept from a combobox → checkbox list of its affixes with level reqs; checked-by-default within the tab's min/max level range, manually overridable.
- `+type` / `-type` — include/exclude **base item types** (belt, map, boots…).

So affixes and base types are two separate axes. The minus buttons are exclusions; output uses POE syntax `"inc|inc" "!exc"`.

**Affix concepts = a THIN stat-based grouping** (not raw 186 groups, not full taxonomy). Raw RePoE groups are mechanic-based and mix concepts (`BaseLocalDefences` = flat armour+evasion+ES). The thin pass splits the messy ones by stat id into user concepts; everything else auto-prettifies its group name. Implement as predicate-based `Concept`:

```ts
type Concept = { id: string; label: string; includes: (a: Affix) => boolean }
```

Curated splits: Flat Armour (`local_base_physical_damage_reduction_rating`), Flat Evasion (`base_evasion_rating`), Flat Energy Shield (`base_maximum_energy_shield`), resistances by element (`base_fire/cold/lightning_damage_resistance_%`) + All (`base_resist_all_elements_%`). Full universal/attack/spell/defence taxonomy + composition pickers still deferred.

### Tab config

```ts
type Floor = 'any' | number       // number = minimum requiredLevel accepted
type TabConfig = {
  band: number                     // max requiredLevel obtainable at this stage (Act1~8, Act3~33, Maps~65)
  selected: Record<GroupId, Floor>      // which affix groups are on + each one's floor
}
type Tab   = { id: string; name: string; config: TabConfig }
type Build = { id: string; name: string; tabs: Tab[] }
type AppState = { builds: Build[]; activeBuildId: string; activeTabId: string }
```

## Solver

Pure function. No false negatives: include ALL qualifying affixes; false positives are acceptable.

```
solve(affixes, config) -> { regex, length }
```

For each selected group with floor `f`:
- gather affixes in that group, with `f <= requiredLevel <= band` (when `f = 'any'`, lower bound is 0)
- emit a fragment per affix:
  - `any` floor (whole group selected) -> a single **catch-all** substring of the shared `text` (e.g. `vem` for "Movement") — tier-agnostic, cheapest
  - specific floor -> cover the qualifying affix **names** (name is tier-selective). Default fragment = distinctive token of the name (`Kiln` from "of the Kiln", keep possessives like `Sprinter's`).
- join all fragments across groups with `|`, dedupe, drop substring-subsumed.

**Budget = 250 chars (POE 0.5).** Generous, so optimization is a FALLBACK: only when `length > 250`, shorten names to minimal covering substrings. Correctness + readability first.

Matching is by affix **name** (creators prefer it — tier breakpoints land on ugly numbers); `text` only for the catch-all.

## Data adapter (offline)

`scripts/build_affixes.ts`: read RePoE `mods.json` (~7.6MB), filter `domain=item` + `genType ∈ {prefix,suffix}`, strip `[A|B]` display markup from `text` (keep B), emit trimmed `src/data/affixes.json`. Re-run per patch. Keeps runtime light — no large fetch / CORS / availability risk.

## Phases

- **Phase 0 — Adapter.** `scripts/build_affixes.ts` -> `src/data/affixes.json`. Checkpoint: movement/resist tiers match inspection.
- **Phase 1 — Solver (TDD).** `src/solver.ts` + vitest. Operates on affix groups. Validate fragments against Crimson's known outputs (resist names at a floor; movement catch-all). This guarantees no-false-negatives.
- **Phase 2 — Default builds.** `src/data/builds.ts` (3-4 seeded default builds, each selecting affix groups + floors per tab). No curated category layer in MVP.
- **Phase 3 — State + persistence.** Build/Tab state in `FunState`; localStorage load/save; export/import a build as JSON.
- **Phase 4 — UI.** fun-web + vanilla-extract: build dropdown (clone/new/delete), tab strip (click = copy+edit), builder body (list of affix groups with per-group floor selects + band; likely searchable since 186 groups), regex output + counter + copy.
- **Phase 5 — Polish.** Copy feedback, >250 warning, group filtering/search.

The pre-discussion scaffold (`src/data/{types,mods,presets}.ts`, `src/solver.ts`, `src/state/app_state.ts`, `src/views/app.ts`) is replaced by the above.

## Deferred refinements (post-MVP)

- **Curated human taxonomy** — roll concepts into universal/attack/spell/defence and add offense/defense composition pickers as sugar.
- **Armour-slot base search** — for classes whose base names don't embed the class word (Boots="Greaves"), coverage depends on the UNVERIFIED question of whether in-game search matches item class or only visible text. Classes that embed the word (Belt, Crossbow, Amulet…) work now.

## Open / loose

- Starting with raw affix groups (no categories); refine the taxonomy later.
- Copy-on-click: every tab click copies (re-click re-copies after edits); explicit Copy button as backup.
- Default builds: small curated set; breadth comes from user clone/share, not our curation.
