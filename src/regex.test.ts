import { describe, it, expect } from 'vitest'
import { tab_solve, concept_affixes } from './regex'
import type { TabConfig } from './state/app_state'

const config = (over: Partial<TabConfig> = {}): TabConfig => ({
  min_level: null,
  max_level: null,
  selections: [],
  ...over,
})

describe('tab_solve', () => {
  it('empty selection yields empty regex', () => {
    expect(tab_solve(config()).regex).toBe('')
  })

  it('movement include within a band lists the qualifying tier names', () => {
    const result = tab_solve(
      config({
        max_level: 33,
        selections: [{ concept_id: 'group_MovementVelocity', sign: 'include', overrides: {} }],
      }),
    )
    // Real data: Runner's(1), Sprinter's(16), Stallion's(33) are <= 33.
    expect(result.regex).toContain("Sprinter's")
    expect(result.regex).toContain("Stallion's")
    expect(result.regex).not.toContain("Gazelle's") // req 46, above band
  })

  it('a per-affix override forces an out-of-band affix in', () => {
    const tiers = concept_affixes('group_MovementVelocity')
    const gazelle = tiers.find((a) => a.name === "Gazelle's")
    expect(gazelle).toBeDefined()
    if (!gazelle) return
    const result = tab_solve(
      config({
        max_level: 33,
        selections: [
          { concept_id: 'group_MovementVelocity', sign: 'include', overrides: { [gazelle.id]: true } },
        ],
      }),
    )
    expect(result.regex).toContain("Gazelle's")
  })

  it('exclude selection emits negated terms', () => {
    const result = tab_solve(
      config({
        max_level: 33,
        selections: [
          { concept_id: 'group_MovementVelocity', sign: 'include', overrides: {} },
          { concept_id: 'res_fire', sign: 'exclude', overrides: {} },
        ],
      }),
    )
    expect(result.regex).toContain('"!')
  })
})
