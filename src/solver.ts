import type { Affix, Concept, LevelRange } from './data/types'

export const BUDGET = 250

export type SolveResult = {
  readonly regex: string
  readonly length: number
  readonly over_budget: boolean
}

// "of the Kiln" -> "Kiln", "of Magma" -> "Magma". Possessive prefixes ("Sprinter's")
// are left whole. Safe: the item text still contains the stripped token.
const distinctive_token = (name: string): string =>
  name.replace(/^of the /i, '').replace(/^of /i, '')

export const fragment_for = (affix: Affix): string => distinctive_token(affix.name)

// Keep a minimal set: if one fragment is a substring of another, the shorter one
// already matches everything the longer one would, so drop the longer.
const drop_subsumed = (fragments: readonly string[]): string[] => {
  const unique = [...new Set(fragments)].sort((a, b) => a.length - b.length)
  const kept: string[] = []
  for (const f of unique) {
    if (!kept.some((k) => f.includes(k))) kept.push(f)
  }
  return kept
}

const fragments_of = (affixes: readonly Affix[]): string[] =>
  drop_subsumed(affixes.filter((a) => a.name.length > 0).map(fragment_for))

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
