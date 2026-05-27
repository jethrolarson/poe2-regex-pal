import type { FunState } from '@fun-land/fun-state'
import { Acc } from '@fun-land/accessor'
import type { AppState, Build, Tab, TabConfig } from '../state/app_state'

export const find_active_build = (s: AppState): Build | undefined =>
  s.builds.find((b) => b.id === s.active_build_id)

export const find_active_tab = (b: Build | undefined, s: AppState): Tab | undefined =>
  b?.tabs.find((t) => t.id === s.active_tab_id)

export const active_build_acc = Acc<AppState, Build>({
  query: (s): Build[] => {
    const b = find_active_build(s)
    return b === undefined ? [] : [b]
  },
  mod: (fn) => (s) => ({
    ...s,
    builds: s.builds.map((b) => (b.id === s.active_build_id ? fn(b) : b)),
  }),
})

export const active_tab_acc = Acc<AppState, Tab>({
  query: (s): Tab[] => {
    const t = find_active_tab(find_active_build(s), s)
    return t === undefined ? [] : [t]
  },
  mod: (fn) => (s) =>
    active_build_acc.mod((b) => ({
      ...b,
      tabs: b.tabs.map((t) => (t.id === s.active_tab_id ? fn(t) : t)),
    }))(s),
})

export const active_tab_config_acc = active_tab_acc.prop('config')

export const map_active_build = (s: AppState, fn: (b: Build) => Build): AppState => active_build_acc.mod(fn)(s)

export const update_config = (app$: FunState<AppState>, fn: (c: TabConfig) => TabConfig): void =>
  app$.focus(active_tab_config_acc).mod(fn)
