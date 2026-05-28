import type { Affix } from "../Affix/Affix"

// A selectable affix concept: a named set of affixes defined by a predicate.
// `any_phrase` is the shared stat-line fragment that matches every member (e.g.
// "to Armour"). When present and the user has the whole concept selected, the
// solver emits this one phrase instead of enumerating every tier name.
export type Concept = {
    readonly id: string
    readonly label: string
    readonly includes: (affix: Affix) => boolean
    readonly any_phrase?: string
}