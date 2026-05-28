import { describe, it, expect } from 'vitest'
import type { Affix } from '../Affix/Affix'
import { solve, select_affixes, fragment_for, in_band, BUDGET } from './solver'

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

const affix = (
  id: string,
  name: string,
  group: string,
  required_level: number,
  stat_id: string,
): Affix => ({
  id,
  name,
  text: `${name} text`,
  group,
  required_level,
  gen_type: 'prefix',
  stats: [{ id: stat_id, min: 0, max: 0 }],
})

const MV = 'base_movement_velocity_+%'
const FR = 'base_fire_damage_resistance_%'

const movement: Affix[] = [
  affix('MovementVelocity1', "Runner's", 'MovementVelocity', 1, MV),
  affix('MovementVelocity2', "Sprinter's", 'MovementVelocity', 16, MV),
  affix('MovementVelocity3', "Stallion's", 'MovementVelocity', 33, MV),
  affix('MovementVelocity4', "Gazelle's", 'MovementVelocity', 46, MV),
]

const fire_res: Affix[] = [
  affix('FireResist3', 'of the Drake', 'FireResistance', 24, FR),
  affix('FireResist4', 'of the Kiln', 'FireResistance', 36, FR),
  affix('FireResist5', 'of the Furnace', 'FireResistance', 48, FR),
]

const movement_concept = { id: 'mv', label: 'Movement Speed', includes: (a: Affix) => a.group === 'MovementVelocity' }
const fire_res_concept = { id: 'fr', label: 'Fire Resistance', includes: (a: Affix) => a.stats.some((s) => s.id === FR) }

describe('fragment_for', () => {
  it('strips leading "of the" / "of"', () => {
    expect(fragment_for(fire_res[1])).toBe('Kiln')
    expect(fragment_for(affix('x', 'of Magma', 'g', 1, FR))).toBe('Magma')
  })
  it('leaves possessive prefixes whole', () => {
    expect(fragment_for(movement[1])).toBe("Sprinter's")
  })
})

describe('fragment_for (implicit / nameless)', () => {
  const implicit = (text: string): Affix => ({
    id: 'imp',
    name: '',
    text,
    group: 'g',
    required_level: 1,
    gen_type: 'implicit',
    stats: [],
  })
  it('matches descriptive text with roll numbers stripped', () => {
    expect(fragment_for(implicit('+(10-15) to Intelligence'))).toBe('to Intelligence')
    expect(fragment_for(implicit('(20-30)% increased Bolt Speed'))).toBe('increased Bolt Speed')
    expect(fragment_for(implicit('Grenade Skills Fire an additional Projectile'))).toBe(
      'Grenade Skills Fire an additional Projectile',
    )
  })
})

describe('in_band', () => {
  it('respects min and max', () => {
    expect(in_band(movement[1], { min: 16, max: 33 })).toBe(true) // req 16
    expect(in_band(movement[0], { min: 16 })).toBe(false) // req 1
    expect(in_band(movement[3], { max: 33 })).toBe(false) // req 46
  })
})

describe('select_affixes + solve (includes)', () => {
  it('floor picks the qualifying named tiers', () => {
    const re = solve(select_affixes(movement, movement_concept, { min: 16, max: 46 })).regex
    expect(matches(re, "Sprinter's")).toBe(true)
    expect(matches(re, "Stallion's")).toBe(true)
    expect(matches(re, "Gazelle's")).toBe(true)
    expect(matches(re, "Runner's")).toBe(false) // req 1, below the floor
  })

  it('any-floor includes every tier (no false negatives)', () => {
    const re = solve(select_affixes(movement, movement_concept, { max: 46 })).regex
    for (const name of ["Runner's", "Sprinter's", "Stallion's", "Gazelle's"]) {
      expect(matches(re, name)).toBe(true)
    }
  })

  it('fire res floor uses stripped names across the band', () => {
    const re = solve(select_affixes(fire_res, fire_res_concept, { min: 36 })).regex
    expect(matches(re, 'of the Kiln')).toBe(true)
    expect(matches(re, 'of the Furnace')).toBe(true)
    expect(matches(re, 'of the Drake')).toBe(false) // req 24, below the floor
  })
})

describe('solve (excludes)', () => {
  it('emits POE negated-term syntax that still matches the right items', () => {
    const result = solve([movement[1]], [fire_res[0]])
    expect(matches(result.regex, "Sprinter's")).toBe(true)
    expect(matches(result.regex, 'of the Drake')).toBe(false)
  })
})

describe('drop_subsumed', () => {
  it('drops a fragment when a shorter one is its substring', () => {
    const plate = affix('a', 'Plate', 'g', 1, MV)
    const plated = affix('b', 'Plated', 'g', 1, MV)
    expect(matches(solve([plate, plated]).regex, 'Plated')).toBe(true)
    expect(matches(solve([plate, plated]).regex, 'Plate')).toBe(true)
  })
})

describe('budget', () => {
  it('flags over_budget past 250 chars', () => {
    // Nameless implicits aren't abbreviated, so their distinct phrases stack up.
    // Fixed-length two-letter codes (no digits) keep them distinct and unsubsumable.
    const az = 'abcdefghijklmnopqrstuvwxyz'
    const code = (i: number): string => `${az[Math.floor(i / 26)] ?? 'z'}${az[i % 26] ?? 'z'}`
    const many: Affix[] = Array.from({ length: 40 }, (_, i) => ({
      id: `imp${i}`,
      name: '',
      text: `Wibble ${code(i)} Quux`,
      group: 'g',
      required_level: 1,
      gen_type: 'implicit',
      stats: [],
    }))
    const result = solve(many)
    expect(result.length).toBeGreaterThan(BUDGET)
    expect(result.over_budget).toBe(true)
  })
})
