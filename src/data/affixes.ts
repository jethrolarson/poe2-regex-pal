import type { Affix, GenType } from './types'
import raw_affixes from './affixes.json'

const to_gen_type = (g: string): GenType => {
  if (g === 'prefix' || g === 'suffix' || g === 'implicit') return g
  throw new Error(`Unexpected gen_type: ${g}`)
}

export const AFFIXES: readonly Affix[] = raw_affixes.map((r) => ({
  id: r.id,
  name: r.name,
  text: r.text,
  group: r.group,
  required_level: r.required_level,
  gen_type: to_gen_type(r.gen_type),
  stats: r.stats,
}))
