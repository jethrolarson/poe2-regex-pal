import { Acc, append } from '@fun-land/accessor'
import { type FunState, merge } from '@fun-land/fun-state'
import type { AppState, Build, Tab } from './AppState_types'
import { new_id } from '../uuid'
import { GENERIC_BUILD } from './presets'
import type { ConceptInclusion, TabConfig } from '../TabConfig/TabConfig_types'
import { make_selection } from '../TabConfig/TabConfig_operations'
import { parse_build } from './AppState_persistance'

const first_tab_id = GENERIC_BUILD.tabs[0]?.id ?? ''

export const initial_app_state: AppState = {
    builds: [GENERIC_BUILD],
    active_build_id: GENERIC_BUILD.id,
    active_tab_id: first_tab_id,
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

export const blank_tab = (name: string): Tab => ({
    id: new_id(),
    name,
    config: { selections: [] },
})

export const switch_build = (app$: FunState<AppState>, id: string): void => {
    const s = app$.get()
    const b = s.builds.find((x) => x.id === id)
    if (b !== undefined) merge(app$)({ active_build_id: id, active_tab_id: b.tabs[0]?.id ?? '' })
}

export const find_active_tab_config = (s: AppState): TabConfig =>
    find_active_tab(find_active_build(s), s)?.config ?? { selections: [] }

export const rename_active_build = (app$: FunState<AppState>, name: string): void =>
    app$.focus(active_build_acc).prop('name').set(name)

export const rename_active_tab = (app$: FunState<AppState>, name: string): void =>
    app$.focus(active_tab_acc).prop('name').set(name)

export const clear_data = (app$: FunState<AppState>): void => app$.set(initial_app_state)

const _add_build = (build: Build) => (s: AppState): AppState => {
    return { ...s, builds: [...s.builds, build], active_build_id: build.id, active_tab_id: build.tabs[0]?.id ?? '' }
}

// Imports a pasted build, regenerating ids so it can't collide with existing builds if build is imported twice.
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
        // Regenerate ids so it can't collide with existing builds
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

const _add_tab = (tab: Tab) => (s: AppState): AppState => active_build_acc.prop('tabs').mod(append(tab))(s)

export const add_tab = (app$: FunState<AppState>): void =>
    app$.mod(s => {

        return _add_tab(blank_tab(`Tab ${(find_active_build(s)?.tabs.length ?? 0) + 1}`))(s)
    })


export const select_tab = (app$: FunState<AppState>, t: Tab): void => {
    app$.prop('active_tab_id').set(t.id)
}

// New selection inherits the last selection's tier range (sticky), full range if none.
export const add_selection = (config$: FunState<TabConfig>, concept_id: string, sign: ConceptInclusion): void =>
    config$.prop('selections').mod((sels) => {
        const last = sels[sels.length - 1]
        return [...sels, make_selection(concept_id, sign, last?.min_level ?? null, last?.max_level ?? null)]
    })