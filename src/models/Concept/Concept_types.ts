import type { Affix } from "../Affix/Affix"

// A selectable affix concept: a named set of affixes defined by a predicate.
export type Concept = {
    readonly id: string
    readonly label: string
    readonly includes: (affix: Affix) => boolean
}