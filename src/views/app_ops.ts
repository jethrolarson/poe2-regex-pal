import { merge, type FunState } from '@fun-land/fun-state'
import type { AppState, Build, Tab, Sign } from '../state/app_state'
import { new_id } from '../state/app_state'
import { tab_solve } from '../regex'
import { find_active_build, map_active_build, update_config } from './app_optics'

export const blank_tab = (name: string): Tab => ({
  id: new_id(),
  name,
  config: { min_level: null, max_level: null, selections: [] },
})

export const switch_build = (app$: FunState<AppState>, id: string): void => {
  const s = app$.get()
  const b = s.builds.find((x) => x.id === id)
  if (b !== undefined) merge(app$)({ active_build_id: id, active_tab_id: b.tabs[0]?.id ?? '' })
}

export const open_picker = (app$: FunState<AppState>): void => merge(app$)({ picker_open: true })

export const add_build = (app$: FunState<AppState>): void =>
  app$.mod((s) => {
    const t = blank_tab('Tab 1')
    const b: Build = { id: new_id(), name: 'New Build', tabs: [t] }
    return { ...s, builds: [...s.builds, b], active_build_id: b.id, active_tab_id: t.id }
  })

export const clone_build = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    const src = find_active_build(s)
    if (src === undefined) return s
    const tabs = src.tabs.map((t) => ({ ...t, id: new_id() }))
    const b: Build = { id: new_id(), name: `${src.name} (copy)`, tabs }
    return { ...s, builds: [...s.builds, b], active_build_id: b.id, active_tab_id: tabs[0]?.id ?? '' }
  })
}

export const delete_build = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    if (s.builds.length <= 1) return s
    const remaining = s.builds.filter((b) => b.id !== s.active_build_id)
    const next = remaining[0]
    if (next === undefined) return s
    return { ...s, builds: remaining, active_build_id: next.id, active_tab_id: next.tabs[0]?.id ?? '' }
  })
}

export const add_tab = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    const t = blank_tab(`Tab ${(find_active_build(s)?.tabs.length ?? 0) + 1}`)
    return { ...map_active_build(s, (b) => ({ ...b, tabs: [...b.tabs, t] })), active_tab_id: t.id }
  })
}

export const select_tab = (app$: FunState<AppState>, t: Tab): void => {
  void navigator.clipboard.writeText(tab_solve(t.config).regex)
  app$.prop('active_tab_id').set(t.id)
}

export const add_selection = (app$: FunState<AppState>, concept_id: string, sign: Sign): void => {
  update_config(app$, (c) => ({ ...c, selections: [...c.selections, { concept_id, sign, overrides: {} }] }))
}

export const remove_selection = (app$: FunState<AppState>, index: number): void => {
  update_config(app$, (c) => ({ ...c, selections: c.selections.filter((_, i) => i !== index) }))
}

export const set_override = (app$: FunState<AppState>, index: number, affix_id: string, checked: boolean): void => {
  update_config(app$, (c) => ({
    ...c,
    selections: c.selections.map((s, i) =>
      i === index ? { ...s, overrides: { ...s.overrides, [affix_id]: checked } } : s,
    ),
  }))
}

export const set_all_overrides = (
  app$: FunState<AppState>,
  index: number,
  affix_ids: readonly string[],
  checked: boolean,
): void => {
  const overrides = Object.fromEntries(affix_ids.map((id) => [id, checked]))
  update_config(app$, (c) => ({
    ...c,
    selections: c.selections.map((s, i) => (i === index ? { ...s, overrides } : s)),
  }))
}
