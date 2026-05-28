import { describe, it, expect } from 'vitest'
import { tab_solve, concept_affixes } from './Regex_operations'
import { make_selection } from '../TabConfig/TabConfig_operations'
import type { TabConfig } from '../TabConfig/TabConfig_types'

const config = (selections: TabConfig['selections'] = []): TabConfig => ({ selections })

describe('tab_solve', () => {
  it('empty selection yields empty regex', () => {
    expect(tab_solve(config()).regex).toBe('')
  })

  it('a stamped range includes only the in-range tier names', () => {
    const result = tab_solve(config([make_selection('group_MovementVelocity', 'include', null, 33)]))
    // Runner's(1), Sprinter's(16), Stallion's(33) are <= 33; Gazelle's(46) is not.
    expect(result.regex).toContain("Sprinter's")
    expect(result.regex).toContain("Stallion's")
    expect(result.regex).not.toContain("Gazelle's")
  })

  it('a per-affix override flips an out-of-range affix in', () => {
    const gazelle = concept_affixes('group_MovementVelocity').find((a) => a.name === "Gazelle's")
    expect(gazelle).toBeDefined()
    if (!gazelle) return
    const base = make_selection('group_MovementVelocity', 'include', null, 33)
    const sel = { ...base, overrides: { ...base.overrides, [gazelle.id]: true } }
    expect(tab_solve(config([sel])).regex).toContain("Gazelle's")
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
