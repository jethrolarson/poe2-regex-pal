export type Sign = 'include' | 'exclude'

// A concept the user pulled into a tab. `overrides` records per-affix deviations
// from the level-range default (affix id -> forced checked state).
export type ConceptSelection = {
  readonly concept_id: string
  readonly sign: Sign
  readonly overrides: Readonly<Record<string, boolean>>
}

export type TabConfig = {
  readonly min_level: number | null
  readonly max_level: number | null
  readonly selections: readonly ConceptSelection[]
}

export type Tab = {
  readonly id: string
  readonly name: string
  readonly config: TabConfig
}

export type Build = {
  readonly id: string
  readonly name: string
  readonly tabs: readonly Tab[]
}

export type AppState = {
  readonly builds: readonly Build[]
  readonly active_build_id: string
  readonly active_tab_id: string
}

export const new_id = (): string => crypto.randomUUID()

const include = (concept_id: string): ConceptSelection => ({
  concept_id,
  sign: 'include',
  overrides: {},
})

const UNIVERSAL = [include('group_MovementVelocity'), include('group_IncreasedLife'), include('res_all')]

const act_tab = (name: string, max_level: number): Tab => ({
  id: `t_generic_${name.toLowerCase().replace(/\s+/g, '')}`,
  name,
  config: { min_level: null, max_level, selections: UNIVERSAL },
})

const GENERIC_BUILD: Build = {
  id: 'b_generic',
  name: 'Leveling (generic)',
  tabs: [act_tab('Act 1', 12), act_tab('Act 2', 24), act_tab('Act 3', 36), act_tab('Act 4', 48)],
}

const first_tab_id = GENERIC_BUILD.tabs[0]?.id ?? ''

export const initial_app_state: AppState = {
  builds: [GENERIC_BUILD],
  active_build_id: GENERIC_BUILD.id,
  active_tab_id: first_tab_id,
}
