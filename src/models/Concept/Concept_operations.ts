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
  { id: 'flat_armour', label: 'Flat Armour', includes: has_stat('local_base_physical_damage_reduction_rating'), any_phrase: 'to Armour' },
  { id: 'flat_evasion', label: 'Flat Evasion', includes: has_stat('base_evasion_rating'), any_phrase: 'to Evasion Rating' },
  { id: 'flat_energy_shield', label: 'Flat Energy Shield', includes: has_stat('base_maximum_energy_shield'), any_phrase: 'to maximum Energy Shield' },
  { id: 'res_fire', label: 'Fire Resistance', includes: has_stat('base_fire_damage_resistance_%'), any_phrase: 'to Fire Resistance' },
  { id: 'res_cold', label: 'Cold Resistance', includes: has_stat('base_cold_damage_resistance_%'), any_phrase: 'to Cold Resistance' },
  { id: 'res_lightning', label: 'Lightning Resistance', includes: has_stat('base_lightning_damage_resistance_%'), any_phrase: 'to Lightning Resistance' },
  { id: 'res_chaos', label: 'Chaos Resistance', includes: has_stat('base_chaos_damage_resistance_%'), any_phrase: 'to Chaos Resistance' },
  { id: 'res_all', label: 'All Elemental Resistances', includes: has_stat('base_resist_all_elements_%'), any_phrase: 'to all Elemental Resistances' },
]

// "+to Level of <category> Skills" is one RePoE group spanning every skill category,
// but players pick a category for their build. Split it: one concept per gem-level
// stat, each matched by its shared stat line. [stat suffix, label, phrase]
const GEM_LEVEL_CATEGORIES: readonly (readonly [string, string, string])[] = [
  ['attack', 'Attack Gem Level', 'to Level of all Attack Skills'],
  ['spell', 'Spell Gem Level', 'to Level of all Spell Skills'],
  ['projectile', 'Projectile Gem Level', 'to Level of all Projectile Skills'],
  ['melee', 'Melee Gem Level', 'to Level of all Melee Skills'],
  ['minion', 'Minion Gem Level', 'to Level of all Minion Skills'],
  ['fire_spell', 'Fire Spell Gem Level', 'to Level of all Fire Spell Skills'],
  ['cold_spell', 'Cold Spell Gem Level', 'to Level of all Cold Spell Skills'],
  ['lightning_spell', 'Lightning Spell Gem Level', 'to Level of all Lightning Spell Skills'],
  ['physical_spell', 'Physical Spell Gem Level', 'to Level of all Physical Spell Skills'],
  ['chaos_spell', 'Chaos Spell Gem Level', 'to Level of all Chaos Spell Skills'],
  ['trap', 'Trap Gem Level', 'to Level of all Trap Skill Gems'],
]

const GEM_LEVEL_CONCEPTS: readonly Concept[] = GEM_LEVEL_CATEGORIES.map(([suffix, label, phrase]) => ({
  id: `gem_level_${suffix}`,
  label,
  includes: has_stat(`${suffix}_skill_gem_level_+`),
  any_phrase: phrase,
}))

// Curated concept built from a single discriminating stat id. [id, label, stat, phrase]
type SplitSpec = readonly [string, string, string, string]
const split_concept = ([id, label, stat, phrase]: SplitSpec): Concept => ({
  id,
  label,
  includes: has_stat(stat),
  any_phrase: phrase,
})

// "Reduced Ailment Duration on you" is one RePoE group covering every ailment, but
// a player wards against specific ailments. Split per ailment stat.
const AILMENT_DURATION_CONCEPTS: readonly Concept[] = (
  [
    ['ailment_chill', 'Reduced Chill Duration', 'chill_duration_+%', 'Chill Duration on you'],
    ['ailment_shock', 'Reduced Shock Duration', 'shock_duration_+%', 'Shock duration on you'],
    ['ailment_freeze', 'Reduced Freeze Duration', 'freeze_duration_+%', 'Freeze Duration on you'],
    ['ailment_ignite', 'Reduced Ignite Duration', 'ignite_duration_on_you_+%', 'Ignite Duration on you'],
    ['ailment_poison', 'Reduced Poison Duration', 'poison_duration_on_you_+%', 'Poison Duration on you'],
    ['ailment_bleed', 'Reduced Bleeding Duration', 'bleed_duration_on_you_+%', 'Bleeding Duration on you'],
  ] satisfies readonly SplitSpec[]
).map(split_concept)

// Weapon % damage by type — chaos/cold/fire/lightning/spell-physical are independent
// player choices. Each affix has exactly one stat so splitting is clean.
const WEAPON_DAMAGE_TYPE_CONCEPTS: readonly Concept[] = (
  [
    ['weapon_dmg_chaos', 'Chaos Damage %', 'chaos_damage_+%', 'increased Chaos Damage'],
    ['weapon_dmg_cold', 'Cold Damage %', 'cold_damage_+%', 'increased Cold Damage'],
    ['weapon_dmg_fire', 'Fire Damage %', 'fire_damage_+%', 'increased Fire Damage'],
    ['weapon_dmg_lightning', 'Lightning Damage %', 'lightning_damage_+%', 'increased Lightning Damage'],
    ['weapon_dmg_spell_phys', 'Spell Physical Damage %', 'spell_physical_damage_+%', 'increased Spell Physical Damage'],
  ] satisfies readonly SplitSpec[]
).map(split_concept)

// Spell-added elemental damage is one group spanning the three elements; players
// pick the element matching their spells. Split per element (keyed on the min stat).
const SPELL_ADDED_DAMAGE_CONCEPTS: readonly Concept[] = (
  [
    ['spell_added_cold', 'Added Cold Damage to Spells', 'spell_minimum_added_cold_damage', 'Cold Damage to Spells'],
    ['spell_added_fire', 'Added Fire Damage to Spells', 'spell_minimum_added_fire_damage', 'Fire Damage to Spells'],
    ['spell_added_lightning', 'Added Lightning Damage to Spells', 'spell_minimum_added_lightning_damage', 'Lightning Damage to Spells'],
  ] satisfies readonly SplitSpec[]
).map(split_concept)

// Shared stat-line phrase per raw group, for the "whole concept selected" collapse.
const PHRASE_OVERRIDES: Readonly<Record<string, string>> = {
  IncreasedLife: 'to maximum Life',
  IncreasedMana: 'to maximum Mana',
  MovementVelocity: 'increased Movement Speed',
  StunThreshold: 'to Stun Threshold',
  IncreasedPhysicalDamageReductionRating: 'to Armour',
  FireDamage: 'Fire Damage',
  ColdDamage: 'Cold Damage',
  LightningDamage: 'Lightning Damage',
}

// Friendlier names for groups whose PascalCase prettifies poorly. Extend as needed.
const LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  BaseLocalDefences: 'Flat Defence (mixed)',
  BaseLocalDefencesAndLife: 'Defence % + Life (mixed)',
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

const CURATED_ALL: readonly Concept[] = [
  ...CURATED,
  ...GEM_LEVEL_CONCEPTS,
  ...AILMENT_DURATION_CONCEPTS,
  ...SPELL_ADDED_DAMAGE_CONCEPTS,
  ...WEAPON_DAMAGE_TYPE_CONCEPTS,
]

const covered_by_curated = (a: Affix): boolean => CURATED_ALL.some((c) => c.includes(a))

// One concept per remaining raw group, with affixes already claimed by a curated
// concept removed — so every affix is reachable through exactly the concept that fits.
const group_concepts = (): Concept[] => {
  const groups = [...new Set(AFFIXES.map((a) => a.group))].sort()
  return groups
    .map((g): Concept => {
      const phrase = PHRASE_OVERRIDES[g]
      return {
        id: `group_${g}`,
        label: group_label(g),
        includes: (a: Affix) => a.group === g && !covered_by_curated(a),
        ...(phrase !== undefined ? { any_phrase: phrase } : {}),
      }
    })
    .filter((c) => AFFIXES.some((a) => c.includes(a)))
}

export const CONCEPTS: readonly Concept[] = [...CURATED_ALL, ...group_concepts()]

// Curated "common" picks shown when the picker search is empty. Everything else
// stays reachable via search. Concept ids must exist in CONCEPTS (see test).
export type FeaturedSection = { readonly title: string; readonly concept_ids: readonly string[] }

export const FEATURED: readonly FeaturedSection[] = [
  { title: 'Resistances', concept_ids: ['res_fire', 'res_cold', 'res_lightning', 'res_chaos', 'res_all'] },
  { title: 'Flat Defence', concept_ids: ['flat_armour', 'flat_evasion', 'flat_energy_shield'] },
  { title: 'Life & Mana', concept_ids: ['group_IncreasedLife', 'group_IncreasedMana', 'group_BaseSpirit'] },
  { title: 'Attributes', concept_ids: ['group_Strength', 'group_Intelligence', 'group_Dexterity'] },
  { title: 'Speed', concept_ids: ['group_MovementVelocity', 'group_IncreasedAttackSpeed', 'group_IncreasedCastSpeed'] },
  { title: 'Gem Levels', concept_ids: GEM_LEVEL_CONCEPTS.map((c) => c.id) },
  { title: 'Added Spell Damage', concept_ids: SPELL_ADDED_DAMAGE_CONCEPTS.map((c) => c.id) },
  { title: 'Weapon Damage %', concept_ids: WEAPON_DAMAGE_TYPE_CONCEPTS.map((c) => c.id) },
  { title: 'Ailment Duration', concept_ids: AILMENT_DURATION_CONCEPTS.map((c) => c.id) },
  { title: 'Misc', concept_ids: ['group_ItemFoundRarityIncrease'] },
]

