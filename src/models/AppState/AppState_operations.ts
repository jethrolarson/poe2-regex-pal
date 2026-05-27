import { Acc } from '@fun-land/accessor'
import { type FunState, merge } from '@fun-land/fun-state'
import type { AppState, Build, Tab, TabConfig } from './AppState_types'
import { new_id } from '../uuid'
import { GENERIC_BUILD } from './presets'
import { tab_solve } from '../Regex/Regex_operations'
import type { ConceptInclusion } from '../ConceptSelection'
import { parse_build } from './AppState_persistance'

const first_tab_id = GENERIC_BUILD.tabs[0].id

export const initial_app_state: AppState = {
    builds: [GENERIC_BUILD],
    active_build_id: GENERIC_BUILD.id,
    active_tab_id: first_tab_id,
    picker_open: false,
}

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

export const rename_active_build = (app$: FunState<AppState>, name: string): void =>
    app$.focus(active_build_acc).prop('name').set(name)

export const rename_active_tab = (app$: FunState<AppState>, name: string): void =>
    app$.focus(active_tab_acc).prop('name').set(name)

export const clear_data = (app$: FunState<AppState>): void => app$.set(initial_app_state)

const _add_build = (build: Build) => (s: AppState): AppState => {
    return { ...s, builds: [...s.builds, build], active_build_id: build.id, active_tab_id: build.tabs[0]?.id ?? '' }
}

// Imports a pasted build, regenerating ids so it can't collide with existing builds.
export const import_build = (app$: FunState<AppState>, json: string): boolean => {
    const parsed = parse_build(json)
    if (parsed === null) return false
    const tabs = parsed.tabs.map((t) => ({ ...t, id: new_id() }))
    const b: Build = { id: new_id(), name: parsed.name, tabs }
    app$.mod(_add_build(b))
    return true
}

export const add_new_build = (app$: FunState<AppState>): void => {
    const b: Build = { id: new_id(), name: 'New Build', tabs: [blank_tab('Tab 1')] }
    app$.mod(_add_build(b))
}

export const clone_build = (app$: FunState<AppState>): void => {
    app$.mod((s) => {
        const src = find_active_build(s)
        if (src === undefined) return s
        const tabs = src.tabs.map((t) => ({ ...t, id: new_id() }))
        const b: Build = { id: new_id(), name: `${src.name} (copy)`, tabs }
        return _add_build(b)(s)
    })
}

export const delete_build = (app$: FunState<AppState>): void => {
    app$.mod((s) => {
        const src = find_active_build(s)
        if (src === undefined) return s
        return { ...s, builds: s.builds.filter((b) => b.id !== src.id) }
    })
}

const _add_tab = (tab: Tab) => (s: AppState): AppState => active_build_acc.prop('tabs').mod((tabs) => [...tabs, tab])(s)

export const add_tab = (app$: FunState<AppState>): void =>
    app$.mod(s => {
        const t = blank_tab(`Tab ${(find_active_build(s)?.tabs.length ?? 0) + 1}`)
        return _add_tab(t)(s)
    })


export const select_tab = (app$: FunState<AppState>, t: Tab): void => {
    void navigator.clipboard.writeText(tab_solve(t.config).regex)
    app$.prop('active_tab_id').set(t.id)
}

export const add_selection = (app$: FunState<AppState>, concept_id: string, sign: ConceptInclusion): void => {
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