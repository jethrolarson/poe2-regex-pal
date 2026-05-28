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

// A matchable term plus whether it came from an affix name (abbreviatable) or a
// stat-line phrase (left whole — roll-number gaps make substrings unsafe).
export type Fragment = { readonly text: string; readonly is_name: boolean }

export const affix_fragment = (a: Affix): Fragment => ({
  text: fragment_for(a),
  is_name: is_name_fragment(a),
})

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

// Name fragments shrink to their shortest corpus-unique substring. Phrase
// fragments are left whole. Subsume on full words first (so e.g. "Plate" absorbs
// "Plated"), then abbreviate the survivors, then subsume again to fold any
// newly-redundant abbreviations.
const optimize = (fragments: readonly Fragment[]): string[] => {
  const present = fragments.filter((f) => f.text.length > 0)
  const abbreviated = drop_subsumed(present).map(
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

// Builds the in-game search string from already-collected fragments. Includes are
// OR'd; excludes are separate negated terms: `"inc1|inc2" "!exc1"`.
export const solve_fragments = (
  included: readonly Fragment[],
  excluded: readonly Fragment[] = [],
): SolveResult => {
  const inc = optimize(included).join('|')
  const exc = optimize(excluded)
  const parts = inc.length > 0 ? [`"${inc}"`, ...exc.map((t) => `"!${t}"`)] : []
  const regex = parts.join(' ')
  return { regex, length: regex.length, over_budget: regex.length > BUDGET }
}

export const solve = (
  included: readonly Affix[],
  excluded: readonly Affix[] = [],
): SolveResult => solve_fragments(included.map(affix_fragment), excluded.map(affix_fragment))
