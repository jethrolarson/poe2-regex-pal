import type { TabConfig } from '../TabConfig/TabConfig_types'

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
