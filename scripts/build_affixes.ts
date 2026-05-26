// Offline adapter: RePoE POE2 mods.json -> trimmed src/data/affixes.json
// Run: node scripts/build_affixes.ts [path-to-mods.json]
// With no arg, fetches the latest minified mods from RePoE Fork.
// Re-run per patch.

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const SOURCE_URL = 'https://repoe-fork.github.io/poe2/mods.min.json'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/affixes.json')

type GenType = 'prefix' | 'suffix'

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

const is_gen_type = (g: string): g is GenType => g === 'prefix' || g === 'suffix'

const load_raw = async (arg: string | undefined): Promise<Record<string, RawMod>> => {
  if (arg) return JSON.parse(readFileSync(arg, 'utf8')) as Record<string, RawMod>
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  return (await res.json()) as Record<string, RawMod>
}

const main = async (): Promise<void> => {
  const raw = await load_raw(process.argv[2])

  const affixes: Affix[] = Object.entries(raw)
    .filter(
      ([, m]) =>
        m.domain === 'item' &&
        is_gen_type(m.generation_type) &&
        typeof m.text === 'string' &&
        m.text.length > 0, // drop unreleased placeholders (name 'TBD', null text)
    )
    .map(([id, m]) => ({
      id,
      name: m.name,
      text: clean_text(m.text),
      group: m.groups[0] ?? '',
      required_level: m.required_level,
      gen_type: m.generation_type as GenType,
      stats: m.stats,
    }))
    .sort((a, b) =>
      a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    )

  writeFileSync(OUT, JSON.stringify(affixes, null, 0) + '\n')
  console.log(`Wrote ${affixes.length} affixes -> ${OUT}`)
}

void main()
