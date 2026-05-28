import type { Affix } from '../Affix/Affix'
import type { Concept } from '../Concept/Concept_types'
import type { LevelRange } from './Regex_types'
import { fragment_for, is_name_fragment } from './fragment'
import { abbreviate } from './abbreviate'

export const BUDGET = 250

export type SolveResult = {
  readonly regex: string
  readonly length: number
  readonly over_budget: boolean
}

export { fragment_for }

type Fragment = { readonly text: string; readonly is_name: boolean }

// Keep a minimal set: if one fragment is a substring of another, the shorter one
// already matches everything the longer one would, so drop the longer.
const drop_subsumed = (fragments: readonly Fragment[]): Fragment[] => {
  const unique = [...new Map(fragments.map((f) => [f.text, f])).values()].sort(
    (a, b) => a.text.length - b.text.length,
  )
  const kept: Fragment[] = []
  for (const f of unique) {
    if (!kept.some((k) => f.text.includes(k.text))) kept.push(f)
  }
  return kept
}

// Name fragments shrink to their shortest corpus-unique substring. Implicit
// descriptive phrases are left whole: their roll numbers are stripped mid-string,
// so an arbitrary substring could straddle a gap and stop matching the item.
// Subsume on full words first (so e.g. "Plate" absorbs "Plated"), then abbreviate
// the survivors, then subsume again to fold any newly-redundant abbreviations.
const fragments_of = (affixes: readonly Affix[]): string[] => {
  const tagged = affixes
    .map((a): Fragment => ({ text: fragment_for(a), is_name: is_name_fragment(a) }))
    .filter((f) => f.text.length > 0)
  const abbreviated = drop_subsumed(tagged).map(
    (f): Fragment => ({ text: f.is_name ? abbreviate(f.text) : f.text, is_name: f.is_name }),
  )
  return drop_subsumed(abbreviated).map((f) => f.text)
}

export const in_band = (affix: Affix, range: LevelRange): boolean =>
  affix.required_level >= (range.min ?? 0) &&
  affix.required_level <= (range.max ?? Number.POSITIVE_INFINITY)

export const select_affixes = (
  affixes: readonly Affix[],
  concept: Concept,
  range: LevelRange,
): Affix[] => affixes.filter((a) => concept.includes(a) && in_band(a, range))

// Builds the in-game search string. Includes are OR'd; excludes are separate
// negated terms: `"inc1|inc2" "!exc1"`. With no excludes, just the OR'd includes.
export const solve = (
  included: readonly Affix[],
  excluded: readonly Affix[] = [],
): SolveResult => {
  const inc = fragments_of(included).join('|')
  const exc = fragments_of(excluded)
  const regex =
    exc.length > 0
      ? [`"${inc}"`, ...exc.map((t) => `"!${t}"`)].join(' ')
      : inc
  return { regex, length: regex.length, over_budget: regex.length > BUDGET }
}
