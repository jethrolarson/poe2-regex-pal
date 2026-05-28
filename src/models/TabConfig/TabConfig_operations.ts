import type { FunState } from '@fun-land/fun-state'
import { new_id } from '../uuid'
import { concept_affixes } from '../Regex/Regex_operations'
import { in_band } from '../Regex/solver'
import type { LevelRange } from '../Regex/Regex_types'
import type { ConceptInclusion, ConceptSelection } from './TabConfig_types'

const range_of = (min: number | null, max: number | null): LevelRange => ({
  ...(min !== null ? { min } : {}),
  ...(max !== null ? { max } : {}),
})

/** Checked state for every affix in a concept, by whether its tier is in [min,max]. */
export const stamp_overrides = (
  concept_id: string,
  min: number | null,
  max: number | null,
): Record<string, boolean> =>
  Object.fromEntries(concept_affixes(concept_id).map((a) => [a.id, in_band(a, range_of(min, max))]))

export const make_selection = (
  concept_id: string,
  sign: ConceptInclusion,
  min: number | null,
  max: number | null,
): ConceptSelection => ({
  id: new_id(),
  concept_id,
  sign,
  min_level: min,
  max_level: max,
  overrides: stamp_overrides(concept_id, min, max),
})

export const set_override = (
  selection$: FunState<ConceptSelection>,
  affix_id: string,
  checked: boolean,
): void => selection$.prop('overrides').prop(affix_id).set(checked)

export const set_all_overrides = (
  selection$: FunState<ConceptSelection>,
  affix_ids: readonly string[],
  checked: boolean,
): void => selection$.prop('overrides').set(Object.fromEntries(affix_ids.map((id) => [id, checked])))

/** Re-stamp overrides for a new tier range, remembering the range on the selection. */
export const apply_level_range = (
  selection$: FunState<ConceptSelection>,
  min: number | null,
  max: number | null,
): void =>
  selection$.mod((s) => ({
    ...s,
    min_level: min,
    max_level: max,
    overrides: stamp_overrides(s.concept_id, min, max),
  }))
