import raw_affixes from './affix_data.json'

export type GenType = 'prefix' | 'suffix' | 'implicit'

export type AffixStat = {
    readonly id: string
    readonly min: number
    readonly max: number
}

export type Affix = {
    readonly id: string
    readonly name: string
    readonly text: string
    readonly group: string
    readonly required_level: number
    readonly gen_type: GenType
    readonly stats: readonly AffixStat[]
}

const to_gen_type = (g: string): GenType => {
    if (g === 'prefix' || g === 'suffix' || g === 'implicit') return g
    throw new Error(`Unexpected gen_type: ${g}`)
}

export const AFFIXES: readonly Affix[] = raw_affixes
  .filter((r) => !r.name.startsWith('[DNT'))
  .map((r) => ({
    id: r.id,
    name: r.name,
    text: r.text,
    group: r.group,
    required_level: r.required_level,
    gen_type: to_gen_type(r.gen_type),
    stats: r.stats,
  }))