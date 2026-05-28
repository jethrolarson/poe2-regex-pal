import { AFFIXES } from '../Affix/Affix'
import base_names from '../Affix/base_names.json'
import { distinctive_token } from './fragment'

// The in-game search matches an item's visible text: affix names, affix stat
// lines, and the base item name. A safe abbreviation of a fragment must not be a
// substring of any OTHER matchable string, or it would match unintended items.
// We compare against the fragment-space form of names (the "of the" prefix is
// already stripped) plus the raw stat lines and base names. Lowercased because
// the search is case-insensitive.
export const matchable_corpus: readonly string[] = [
  ...new Set([
    ...AFFIXES.filter((a) => a.name.length > 0).map((a) => distinctive_token(a.name).toLowerCase()),
    ...AFFIXES.map((a) => a.text.toLowerCase()),
    ...base_names.map((n) => n.toLowerCase()),
  ]),
]

// Shortest substring of `fragment` that appears in no other matchable string.
// Always a substring of the original, so it can never introduce a false negative.
// Falls back to the whole fragment when nothing shorter is unique. The fragment's
// own corpus entry is excluded so it doesn't block its own shortening.
export const make_abbreviate = (corpus: readonly string[]): ((fragment: string) => string) => {
  const memo = new Map<string, string>()
  const collides = (candidate: string, own: string): boolean =>
    corpus.some((entry) => entry !== own && entry.includes(candidate))
  return (fragment) => {
    const cached = memo.get(fragment)
    if (cached !== undefined) return cached
    const own = fragment.toLowerCase()
    const n = own.length
    let result = fragment
    outer: for (let len = 1; len <= n; len++) {
      for (let start = 0; start + len <= n; start++) {
        if (!collides(own.slice(start, start + len), own)) {
          result = fragment.slice(start, start + len)
          break outer
        }
      }
    }
    memo.set(fragment, result)
    return result
  }
}

export const abbreviate = make_abbreviate(matchable_corpus)

// Abbreviate a curated phrase against a set of peer phrases — finds the shortest
// substring of each phrase that doesn't appear in any other phrase in the set.
export const make_phrase_abbreviate = (phrases: readonly string[]): ((phrase: string) => string) =>
  make_abbreviate(phrases.map((p) => p.toLowerCase()))
