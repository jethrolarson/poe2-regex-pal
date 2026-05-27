import type { Affix } from '../Affix/Affix'
import type { Concept } from './Concept_types'
import { AFFIXES } from '../Affix/Affix'

const has_stat =
  (id: string) =>
    (a: Affix): boolean =>
      a.stats.some((s) => s.id === id)

// Curated concepts that split mechanic-based RePoE groups (e.g. BaseLocalDefences,
// which bundles flat armour/evasion/ES) into the concepts players actually think in.
const CURATED: readonly Concept[] = [
  { id: 'flat_armour', label: 'Flat Armour', includes: has_stat('local_base_physical_damage_reduction_rating') },
  { id: 'flat_evasion', label: 'Flat Evasion', includes: has_stat('base_evasion_rating') },
  { id: 'flat_energy_shield', label: 'Flat Energy Shield', includes: has_stat('base_maximum_energy_shield') },
  { id: 'res_fire', label: 'Fire Resistance', includes: has_stat('base_fire_damage_resistance_%') },
  { id: 'res_cold', label: 'Cold Resistance', includes: has_stat('base_cold_damage_resistance_%') },
  { id: 'res_lightning', label: 'Lightning Resistance', includes: has_stat('base_lightning_damage_resistance_%') },
  { id: 'res_chaos', label: 'Chaos Resistance', includes: has_stat('base_chaos_damage_resistance_%') },
  { id: 'res_all', label: 'All Elemental Resistances', includes: has_stat('base_resist_all_elements_%') },
]

// Friendlier names for groups whose PascalCase prettifies poorly. Extend as needed.
const LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  BaseLocalDefences: 'Flat Defence (mixed)',
  MovementVelocity: 'Movement Speed',
  IncreasedLife: 'Maximum Life',
  IncreasedMana: 'Maximum Mana',
  IncreasedAttackSpeed: 'Attack Speed',
  IncreasedCastSpeed: 'Cast Speed',
  ItemFoundRarityIncrease: 'Increased Rarity',
  BaseSpirit: 'Spirit',
}

const group_label = (group: string): string =>
  LABEL_OVERRIDES[group] ?? group.replace(/([a-z0-9])([A-Z])/g, '$1 $2')

const covered_by_curated = (a: Affix): boolean => CURATED.some((c) => c.includes(a))

// One concept per remaining raw group, with affixes already claimed by a curated
// concept removed — so every affix is reachable through exactly the concept that fits.
const group_concepts = (): Concept[] => {
  const groups = [...new Set(AFFIXES.map((a) => a.group))].sort()
  return groups
    .map(
      (g): Concept => ({
        id: `group_${g}`,
        label: group_label(g),
        includes: (a: Affix) => a.group === g && !covered_by_curated(a),
      }),
    )
    .filter((c) => AFFIXES.some((a) => c.includes(a)))
}

export const CONCEPTS: readonly Concept[] = [...CURATED, ...group_concepts()]

// Curated "common" picks shown when the picker search is empty. Everything else
// stays reachable via search. Concept ids must exist in CONCEPTS (see test).
export type FeaturedSection = { readonly title: string; readonly concept_ids: readonly string[] }

export const FEATURED: readonly FeaturedSection[] = [
  { title: 'Resistances', concept_ids: ['res_fire', 'res_cold', 'res_lightning', 'res_chaos', 'res_all'] },
  { title: 'Flat Defence', concept_ids: ['flat_armour', 'flat_evasion', 'flat_energy_shield'] },
  { title: 'Life & Mana', concept_ids: ['group_IncreasedLife', 'group_IncreasedMana', 'group_BaseSpirit'] },
  { title: 'Attributes', concept_ids: ['group_Strength', 'group_Intelligence', 'group_Dexterity'] },
  { title: 'Speed', concept_ids: ['group_MovementVelocity', 'group_IncreasedAttackSpeed', 'group_IncreasedCastSpeed'] },
  { title: 'Misc', concept_ids: ['group_ItemFoundRarityIncrease'] },
]

