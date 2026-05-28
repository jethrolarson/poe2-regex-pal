# Concept Audit — large concepts & follow-ups

Concepts with **>10 affixes** (deduped by emitted regex token), and what each needs.
Big lists are a problem because, with no `any_phrase`, a fully-selected concept emits
one fragment per tier and blows the 250-char budget. The fixes are: add an `any_phrase`
(one shared stat line), **split** the concept into the sub-things players actually pick,
or accept it's low-value and leave/deprioritize it.

Generated from the affix data + concept definitions (see `src/models/Concept`,
`src/models/Regex/Regex_operations.ts`). Re-run the audit if the data is refreshed.

## Done

| Concept | # | Treatment |
|---|---|---|
| Flat Armour | 45 | `any_phrase: "to Armour"` |
| Maximum Life | 14 | `any_phrase: "to maximum Life"` |
| Flat Energy Shield | 11 | `any_phrase: "to maximum Energy Shield"` |
| **Increase Socketed Gem Level** | 51 | **split** into 11 per-category concepts (Attack, Spell, Fire/Cold/Lightning/Physical/Chaos Spell, Projectile, Melee, Minion, Trap), each with its own `any_phrase` |
| Maximum Mana | 15 | `any_phrase: "to maximum Mana"` |
| Stun Threshold | 11 | `any_phrase: "to Stun Threshold"` |
| Increased Physical Damage Reduction Rating | 11 | `any_phrase: "to Armour"` (global +Armour; distinct stat from Flat Armour's local one, so not redundant) |
| Fire Damage | 17 | `any_phrase: "Fire Damage"` |
| Cold Damage | 16 | `any_phrase: "Cold Damage"` |
| Lightning Damage | 16 | `any_phrase: "Lightning Damage"` |
| **Reduced Ailment Duration** | 30 | **split** into 6 per-ailment concepts (Chill/Shock/Freeze/Ignite/Poison/Bleeding Duration on you), each with its own `any_phrase` |
| **Spell Added Elemental Damage** | 28 | **split** into 3 per-element concepts (Added Cold/Fire/Lightning Damage to Spells), each with its own `any_phrase` |
| **Weapon Damage Type Prefix** | 80 | **split** into 5 per-stat concepts (Chaos/Cold/Fire/Lightning/Spell Physical Damage %), each with its own `any_phrase` |

(Flat Evasion + the 5 resistances also carry `any_phrase` but have ≤10 tiers.)

## A. Quick wins — single shape, just add `any_phrase`

_All cleared — see Done._ Bucket A is empty: every single-shape concept now carries a phrase.
The safety test (`Concept_operations.test.ts`) verifies each phrase is a substring of every member.

## B. Split per category — one concept hides choices players make separately

The two clean splits (Reduced Ailment Duration, Spell Added Elemental Damage) are
**done** — see above. The remaining two are *not* clean mechanical splits and need a
design decision before touching:

- **Weapon Caster Damage Prefix** (16) — Spell Damage and Trap Damage affixes share the
  **same** stat id (`spell_damage_+%`), so they can't be split by `has_stat`. Splitting
  would require a text predicate (matching "Spell Damage" vs "Trap Damage"). Low value;
  probably leave it.

## C. Low value — %-defence is craftable

Design stance: flat defences matter, percent is craftable. Consider deprioritizing or
hiding this whole family rather than fixing each.

`Defences Percent` (49), `Defence % + Life (mixed)` (36), `…And Mana` (36),
`Defences Percent And Stun Threshold` (36), `…And Defence Percent` (18).

## D. Review / odd

- **Flat Defence (mixed)** (30) — leftover flat *hybrids* (armour+evasion, evasion+ES);
  flat is valued, but these may overlap the curated Flat Evasion / Flat ES concepts.
  Check coverage before touching.
- **Belt Flask Recovery Rate** (13) — life vs mana recovery; minor split.
- **Increased Accuracy** (12) — mostly `to Accuracy Rating`, plus a "no Accuracy Penalty
  from Range" oddball, so no single phrase covers all (would enumerate when fully selected).
- **Life Regeneration** (12) — grab-bag: flat regen, `% increased Life Regeneration rate`,
  and a stray Strength-scaled fire-damage affix. No shared phrase; needs a split (flat regen
  vs % regen) or leave as-is.
