/** POE2 player/item level floor and practical search cap for tier-select options */
export const TAB_LEVEL_MIN = 1
export const TAB_LEVEL_MAX = 100

export type ConceptInclusion = 'include' | 'exclude'

/**
 * A concept on a tab. `min_level`/`max_level` are the last-applied tier range
 * (remembered for the selects). `overrides` is the authoritative per-affix
 * checked state — applying a range stamps it; individual checkboxes edit it.
 */
export type ConceptSelection = {
  readonly id: string
  readonly concept_id: string
  readonly sign: ConceptInclusion
  readonly min_level: number | null
  readonly max_level: number | null
  readonly overrides: Readonly<Record<string, boolean>>
}

export type TabConfig = {
  readonly selections: ConceptSelection[]
}
