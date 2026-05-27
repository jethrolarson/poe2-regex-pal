export type ConceptInclusion = 'include' | 'exclude'
/**
 * A concept the user pulled into a tab. `overrides` records per-affix deviations
 * from the level-range default (affix id -> forced checked state).
 */
export type ConceptSelection = {
    readonly concept_id: string
    readonly sign: ConceptInclusion
    readonly overrides: Readonly<Record<string, boolean>>
}

export const includeConcept = (concept_id: string): ConceptSelection => ({
    concept_id,
    sign: 'include',
    overrides: {},
})