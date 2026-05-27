import { describe, it, expect } from 'vitest'
import { AFFIXES } from '../../data/affixes'
import { CONCEPTS, FEATURED } from './concepts'

const by_id = (id: string) => {
  const c = CONCEPTS.find((x) => x.id === id)
  if (!c) throw new Error(`no concept ${id}`)
  return c
}

const names_of = (concept_id: string): string[] => {
  const c = by_id(concept_id)
  return AFFIXES.filter((a) => c.includes(a)).map((a) => a.name)
}

describe('concepts', () => {
  it('every affix is reachable by at least one concept', () => {
    const orphans = AFFIXES.filter((a) => !CONCEPTS.some((c) => c.includes(a)))
    expect(orphans.map((a) => a.id)).toEqual([])
  })

  it('Flat Armour resolves to the flat-armour tier names', () => {
    const names = names_of('flat_armour')
    expect(names).toContain('Lacquered')
    expect(names).toContain('Plated')
    expect(names).toContain('Carapaced')
  })

  it('Flat Armour excludes pure-evasion affixes', () => {
    const fa = by_id('flat_armour')
    const agile = AFFIXES.find((a) => a.name === 'Agile')
    if (agile) expect(fa.includes(agile)).toBe(false)
  })

  it('every FEATURED concept id resolves to a real concept', () => {
    const ids = new Set(CONCEPTS.map((c) => c.id))
    const missing = FEATURED.flatMap((s) => s.concept_ids).filter((id) => !ids.has(id))
    expect(missing).toEqual([])
  })

  it('curated affixes are removed from their raw group concept (no duplication)', () => {
    const bld = CONCEPTS.find((c) => c.id === 'group_BaseLocalDefences')
    if (bld) {
      const leak = AFFIXES.filter(
        (a) =>
          bld.includes(a) &&
          a.stats.some((s) => s.id === 'local_base_physical_damage_reduction_rating'),
      )
      expect(leak).toEqual([])
    }
  })
})
