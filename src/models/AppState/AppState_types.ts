import type { ConceptInclusion } from "../ConceptSelection"

// from the level-range default (affix id -> forced checked state).
export type ConceptSelection = {
    readonly concept_id: string
    readonly sign: ConceptInclusion
    readonly overrides: Readonly<Record<string, boolean>>
}

export type TabConfig = {
    readonly min_level: number | null
    readonly max_level: number | null
    readonly selections: ConceptSelection[]
}

export type Tab = {
    readonly id: string
    readonly name: string
    readonly config: TabConfig
}

export type Build = {
    readonly id: string
    readonly name: string
    readonly tabs: Tab[]
}

export type AppState = {
    readonly builds: Build[]
    readonly active_build_id: string
    readonly active_tab_id: string
    /** Modal visibility — in-memory only; never written to `localStorage` */
    readonly picker_open: boolean
}