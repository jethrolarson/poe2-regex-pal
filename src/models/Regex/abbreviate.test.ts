import { describe, it, expect } from 'vitest'
import { abbreviate, make_abbreviate, matchable_corpus } from './abbreviate'
import { AFFIXES } from '../Affix/Affix'
import { fragment_for, is_name_fragment } from './fragment'

describe('make_abbreviate (synthetic corpus)', () => {
  it('returns a substring unique to the fragment', () => {
    const corpus = ["sprinter's", "stallion's", 'increased movement speed', 'iron greaves']
    const abbr = make_abbreviate(corpus)
    const out = abbr("Sprinter's").toLowerCase()
    expect("sprinter's".includes(out)).toBe(true) // substring => no false negative
    const others = corpus.filter((c) => c !== "sprinter's")
    expect(others.some((c) => c.includes(out))).toBe(false) // unique => no new false positive
  })

  it('falls back to the whole fragment when nothing shorter is unique', () => {
    const abbr = make_abbreviate(['abc', 'xabcx'])
    expect(abbr('abc')).toBe('abc')
  })

  it('never returns a longer string than the fragment', () => {
    const abbr = make_abbreviate(['hello', 'world'])
    expect(abbr('hello').length).toBeLessThanOrEqual('hello'.length)
  })
})

describe('abbreviate (real corpus)', () => {
  it('every name fragment abbreviation is a substring of the original (no false negatives)', () => {
    const offenders = AFFIXES.filter(is_name_fragment)
      .map(fragment_for)
      .filter((f) => f.length > 0 && !f.toLowerCase().includes(abbreviate(f).toLowerCase()))
    expect(offenders).toEqual([])
  })

  it('a known fragment is unique against the rest of the corpus', () => {
    const out = abbreviate("Sprinter's").toLowerCase()
    const others = matchable_corpus.filter((c) => c !== "sprinter's")
    expect(others.some((c) => c.includes(out))).toBe(false)
  })
})
