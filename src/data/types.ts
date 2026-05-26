export type GenType = 'prefix' | 'suffix'

export type AffixStat = {
  readonly id: string
  readonly min: number
  readonly max: number
}

export type Affix = {
  readonly id: string
  readonly name: string
  readonly text: string
  readonly group: string
  readonly required_level: number
  readonly gen_type: GenType
  readonly stats: readonly AffixStat[]
}

// A selectable affix concept: a named set of affixes defined by a predicate.
export type Concept = {
  readonly id: string
  readonly label: string
  readonly includes: (affix: Affix) => boolean
}

export type LevelRange = {
  readonly min?: number
  readonly max?: number
}
