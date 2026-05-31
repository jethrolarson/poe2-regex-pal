import type { Affix } from "../Affix/Affix"

export type AffixConcept = {
  readonly kind: 'affix'
  readonly id: string
  readonly label: string
  readonly includes: (affix: Affix) => boolean
  readonly any_phrase?: string
}

// A concept that emits curated regex fragments directly, with no per-tier
// control. Used for pseudo/aggregate concepts that span multiple stat groups.
// Fragments are stored as readable phrases and abbreviated at solve time.
export type RegexConcept = {
  readonly kind: 'regex'
  readonly id: string
  readonly label: string
  readonly fragments: readonly string[]
}

export type Concept = AffixConcept | RegexConcept
