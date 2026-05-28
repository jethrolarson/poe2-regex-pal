import { describe, it, expect } from 'vitest'
import { tab_solve, concept_affixes } from './Regex_operations'
import { make_selection } from '../TabConfig/TabConfig_operations'
import type { TabConfig } from '../TabConfig/TabConfig_types'

const config = (selections: TabConfig['selections'] = []): TabConfig => ({ selections })

// The emitted regex is matched case-insensitively against an item's visible text.
const matches = (regex: string, item_text: string): boolean => new RegExp(regex, 'i').test(item_text)

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
