import { describe, it, expect } from 'vitest'
import type { Affix } from './data/types'
import { solve, select_affixes, fragment_for, in_band, BUDGET } from './solver'

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

const tokens = (regex: string): string[] => regex.split('|').sort()

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
    const picked = select_affixes(movement, movement_concept, { min: 16, max: 46 })
    expect(tokens(solve(picked).regex)).toEqual(["Gazelle's", "Sprinter's", "Stallion's"])
  })

  it('any-floor includes every tier (no false negatives)', () => {
    const picked = select_affixes(movement, movement_concept, { max: 46 })
    expect(tokens(solve(picked).regex)).toEqual(["Gazelle's", "Runner's", "Sprinter's", "Stallion's"])
  })

  it('fire res floor uses stripped names across the band', () => {
    const picked = select_affixes(fire_res, fire_res_concept, { min: 36 })
    expect(tokens(solve(picked).regex)).toEqual(['Furnace', 'Kiln'])
  })
})

describe('solve (excludes)', () => {
  it('emits POE negated-term syntax', () => {
    const result = solve([movement[1]], [fire_res[0]])
    expect(result.regex).toBe('"Sprinter\'s" "!Drake"')
  })
})

describe('drop_subsumed', () => {
  it('drops a fragment when a shorter one is its substring', () => {
    const plate = affix('a', 'Plate', 'g', 1, MV)
    const plated = affix('b', 'Plated', 'g', 1, MV)
    expect(solve([plate, plated]).regex).toBe('Plate')
  })
})

describe('budget', () => {
  it('flags over_budget past 250 chars', () => {
    // Fixed-length distinct names so none subsumes another.
    const many = Array.from({ length: 40 }, (_, i) =>
      affix(`a${i}`, `Frag${i.toString().padStart(2, '0')}`, 'g', 1, MV),
    )
    const result = solve(many)
    expect(result.length).toBeGreaterThan(BUDGET)
    expect(result.over_budget).toBe(true)
  })
})
