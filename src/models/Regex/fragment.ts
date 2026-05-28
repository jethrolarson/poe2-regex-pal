import type { Affix } from '../Affix/Affix'

// "of the Kiln" -> "Kiln", "of Magma" -> "Magma". Possessive prefixes ("Sprinter's")
// are left whole. Safe: the item text still contains the stripped token.
export const distinctive_token = (name: string): string =>
  name.replace(/^of the /i, '').replace(/^of /i, '')

// Implicits have no affix name, so we match their stat line. Roll values are
// stripped because items show the rolled number (+12), not the range (10-15).
export const descriptive_phrase = (text: string): string =>
  text
    .replace(/\n/g, ' ')
    .replace(/[+-]?\(?\d[\d.,\s–-]*\)?%?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const fragment_for = (affix: Affix): string =>
  affix.name.length > 0 ? distinctive_token(affix.name) : descriptive_phrase(affix.text)

export const is_name_fragment = (affix: Affix): boolean => affix.name.length > 0
