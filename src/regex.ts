import type { Affix, Concept, LevelRange } from './data/types'
import { AFFIXES } from './data/affixes'
import { CONCEPTS } from './concepts'
import { solve, in_band, type SolveResult } from './solver'
import type { ConceptSelection, TabConfig } from './state/app_state'

const concept_by_id: ReadonlyMap<string, Concept> = new Map(CONCEPTS.map((c) => [c.id, c]))

const range_of = (config: TabConfig): LevelRange => ({
  ...(config.min_level !== null ? { min: config.min_level } : {}),
  ...(config.max_level !== null ? { max: config.max_level } : {}),
})

// Affixes effectively checked for a selection: concept members whose level-range
// default is flipped by any per-affix override.
const affixes_of = (selection: ConceptSelection, range: LevelRange): Affix[] => {
  const concept = concept_by_id.get(selection.concept_id)
  if (concept === undefined) return []
  return AFFIXES.filter((a) => {
    if (!concept.includes(a)) return false
    return selection.overrides[a.id] ?? in_band(a, range)
  })
}

const dedupe = (affixes: readonly Affix[]): Affix[] => [
  ...new Map(affixes.map((a) => [a.id, a])).values(),
]

const collect = (config: TabConfig, sign: ConceptSelection['sign']): Affix[] => {
  const range = range_of(config)
  return dedupe(
    config.selections
      .filter((s) => s.sign === sign)
      .flatMap((s) => affixes_of(s, range)),
  )
}

export const tab_solve = (config: TabConfig): SolveResult =>
  solve(collect(config, 'include'), collect(config, 'exclude'))

export const concept_affixes = (concept_id: string): readonly Affix[] => {
  const concept = concept_by_id.get(concept_id)
  if (concept === undefined) return []
  return AFFIXES.filter((a) => concept.includes(a))
    .slice()
    .sort((a, b) => a.required_level - b.required_level)
}

const sample_cache = new Map<string, string>()
export const concept_sample = (concept_id: string): string => {
  const cached = sample_cache.get(concept_id)
  if (cached !== undefined) return cached
  const sample = concept_affixes(concept_id)[0]?.text ?? ''
  sample_cache.set(concept_id, sample)
  return sample
}

// Precomputed once: concept label + all its affix names/texts, lowercased.
const search_index: ReadonlyMap<string, string> = new Map(
  CONCEPTS.map((c) => {
    const body = AFFIXES.filter((a) => c.includes(a))
      .map((a) => `${a.name} ${a.text}`)
      .join(' ')
    return [c.id, `${c.label} ${body}`.toLowerCase()]
  }),
)

export const search_concepts = (query: string): Concept[] => {
  const q = query.trim().toLowerCase()
  if (q === '') return []
  return CONCEPTS.filter((c) => (search_index.get(c.id) ?? '').includes(q))
}
