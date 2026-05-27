// Offline adapter: RePoE POE2 mods.json (+ base_items.json) -> trimmed src/data/affixes.json
// Run: node scripts/build_affixes.ts [mods.json] [base_items.json]
// With no args, fetches the latest minified data from RePoE Fork. Re-run per patch.

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const MODS_URL = 'https://repoe-fork.github.io/poe2/mods.min.json'
const BASES_URL = 'https://repoe-fork.github.io/poe2/base_items.min.json'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/models/Affix/affix_data.json')

type GenType = 'prefix' | 'suffix' | 'implicit'

type RawStat = { id: string; min: number; max: number }
type RawMod = {
  domain: string
  generation_type: string
  name: string
  text: string
  required_level: number
  groups: string[]
  stats: RawStat[]
}
type RawBase = { release_state: string; implicits: string[] }

type Affix = {
  id: string
  name: string
  text: string
  group: string
  required_level: number
  gen_type: GenType
  stats: RawStat[]
}

const clean_text = (text: string): string =>
  text
    .replace(/\[([^\]|]+)\|([^\]]+)\]/g, '$2') // [A|B] -> B (display form)
    .replace(/\[([^\]]+)\]/g, '$1') // [A] -> A

const is_affix_gen = (g: string): boolean => g === 'prefix' || g === 'suffix'

const load_json = async <T>(url: string, override: string | undefined): Promise<T> => {
  if (override) return JSON.parse(readFileSync(override, 'utf8')) as T
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText} (${url})`)
  return (await res.json()) as T
}

const main = async (): Promise<void> => {
  const mods = await load_json<Record<string, RawMod>>(MODS_URL, process.argv[2])
  const bases = await load_json<Record<string, RawBase>>(BASES_URL, process.argv[3])

  // Implicit mods are referenced by released base items; they roll on normal gear
  // and are searchable even though their generation_type isn't prefix/suffix.
  const implicit_ids = new Set<string>()
  for (const base of Object.values(bases)) {
    if (base.release_state === 'released') for (const id of base.implicits) implicit_ids.add(id)
  }

  const affixes: Affix[] = Object.entries(mods)
    .filter(
      ([id, m]) =>
        m.domain === 'item' &&
        typeof m.text === 'string' &&
        m.text.length > 0 &&
        (is_affix_gen(m.generation_type) || implicit_ids.has(id)),
    )
    .map(([id, m]) => ({
      id,
      name: m.name,
      text: clean_text(m.text),
      group: m.groups[0] ?? '',
      required_level: m.required_level,
      gen_type: is_affix_gen(m.generation_type) ? (m.generation_type as GenType) : 'implicit',
      stats: m.stats,
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  writeFileSync(OUT, JSON.stringify(affixes, null, 0) + '\n')
  const implicits = affixes.filter((a) => a.gen_type === 'implicit').length
  console.log(`Wrote ${affixes.length} affixes (${implicits} implicit) -> ${OUT}`)
}

void main()
