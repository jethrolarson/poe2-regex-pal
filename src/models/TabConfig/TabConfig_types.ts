/** POE2 player/item level floor and practical search cap for tab band inputs */
export const TAB_LEVEL_MIN = 1
export const TAB_LEVEL_MAX = 100

export type ConceptInclusion = 'include' | 'exclude'

/** A concept on a tab; `overrides` are per-affix deviations from the level-range default. */
export type ConceptSelection = {
  readonly concept_id: string
  readonly sign: ConceptInclusion
  readonly overrides: Readonly<Record<string, boolean>>
}

export type TabConfig = {
  readonly min_level: number | null
  readonly max_level: number | null
  readonly selections: ConceptSelection[]
}
