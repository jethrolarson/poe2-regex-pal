
import { AFFIXES } from '../Affix/Affix'
import { CONCEPTS } from '../Concept/Concept_operations'
import { affix_fragment, solve_fragments, type Fragment, type SolveResult } from './solver'
import { fragment_for } from './fragment'
import { type Concept } from '../Concept/Concept_types'
import type { TabConfig } from '../TabConfig/TabConfig_types'
import type { Affix } from '../Affix/Affix'
import type { ConceptSelection } from '../TabConfig/TabConfig_types'

const concept_by_id: ReadonlyMap<string, Concept> = new Map(CONCEPTS.map((c) => [c.id, c]))

export const concept_affixes = (concept_id: string): readonly Affix[] => {
  const concept = concept_by_id.get(concept_id)
  if (concept === undefined) return []
  const sort_key = (a: Affix): number => (a.gen_type === 'implicit' ? 0 : 1)
  const sorted = AFFIXES.filter((a) => concept.includes(a))
    .slice()
    .sort((a, b) => sort_key(a) - sort_key(b) || a.required_level - b.required_level)
  // Collapse affixes that emit the same regex token — e.g. one implicit roll
  // carried by several item bases (amulet + ring). They are a single choice.
  const seen = new Set<string>()
  return sorted.filter((a) => {
    const token = fragment_for(a)
    if (seen.has(token)) return false
    seen.add(token)
    return true
  })
}

// Fragments contributed by one selection. When the concept defines an any_phrase
// and every one of its tiers is checked, that single phrase matches them all, so
// emit it instead of every tier name. Otherwise emit a fragment per checked tier.
const selection_fragments = (selection: ConceptSelection): Fragment[] => {
  const concept = concept_by_id.get(selection.concept_id)
  if (concept === undefined) return []
  const members = concept_affixes(selection.concept_id)
  const checked = members.filter((a) => selection.overrides[a.id] ?? false)
  if (checked.length === 0) return []
  if (concept.any_phrase !== undefined && checked.length === members.length) {
    return [{ text: concept.any_phrase, is_name: false }]
  }
  return checked.map(affix_fragment)
}

const collect = (config: TabConfig, sign: ConceptSelection['sign']): Fragment[] =>
  config.selections.filter((s) => s.sign === sign).flatMap(selection_fragments)

export const tab_solve = (config: TabConfig): SolveResult =>
  solve_fragments(collect(config, 'include'), collect(config, 'exclude'))

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
