import { describe, it, expect } from 'vitest'
import { tab_solve, concept_affixes } from './Regex_operations'
import { make_selection } from '../TabConfig/TabConfig_operations'
import type { TabConfig } from '../TabConfig/TabConfig_types'

const config = (selections: TabConfig['selections'] = []): TabConfig => ({ selections })

// Simulate POE2 search: each "..." group is ANDed; "!term" is a negation; "|" is OR within includes.
const matches = (poe2: string, item_text: string): boolean => {
  const lower = item_text.toLowerCase()
  const groups = poe2.match(/"([^"]*)"/g) ?? []
  return groups.every((g) => {
    const content = g.slice(1, -1)
    if (content.startsWith('!')) return !lower.includes(content.slice(1).toLowerCase())
    return content.split('|').some((t) => lower.includes(t.toLowerCase()))
  })
}

describe('tab_solve', () => {
  it('empty selection yields empty regex', () => {
    expect(tab_solve(config()).regex).toBe('')
  })

  it('a stamped range matches the in-range tier names but not the out-of-range one', () => {
    const re = tab_solve(config([make_selection('group_MovementVelocity', 'include', null, 33)])).regex
    // Runner's(1), Sprinter's(16), Stallion's(33) are <= 33; Gazelle's(46) is not.
    expect(matches(re, "Sprinter's")).toBe(true)
    expect(matches(re, "Stallion's")).toBe(true)
    expect(matches(re, "Gazelle's")).toBe(false)
  })

  it('a per-affix override flips an out-of-range affix in', () => {
    const gazelle = concept_affixes('group_MovementVelocity').find((a) => a.name === "Gazelle's")
    expect(gazelle).toBeDefined()
    if (!gazelle) return
    const base = make_selection('group_MovementVelocity', 'include', null, 33)
    const sel = { ...base, overrides: { ...base.overrides, [gazelle.id]: true } }
    expect(matches(tab_solve(config([sel])).regex, "Gazelle's")).toBe(true)
  })

  it('collapses a fully-selected phrase concept to its any_phrase', () => {
    const result = tab_solve(config([make_selection('flat_armour', 'include', null, null)]))
    expect(matches(result.regex, '+(50-80) to Armour')).toBe(true)
  })

  it('enumerates tier names when not every tier is checked', () => {
    const sel = make_selection('flat_armour', 'include', null, null)
    const first = concept_affixes('flat_armour')[0]
    expect(first).toBeDefined()
    if (first === undefined) return
    const partial = { ...sel, overrides: { ...sel.overrides, [first.id]: false } }
    const result = tab_solve(config([partial]))
    expect(matches(result.regex, 'Plated')).toBe(true)
  })

  it('exclude selection emits negated terms', () => {
    const result = tab_solve(
      config([
        make_selection('group_MovementVelocity', 'include', null, 33),
        make_selection('res_fire', 'exclude', null, 33),
      ]),
    )
    expect(result.regex).toContain('"!')
  })
})
