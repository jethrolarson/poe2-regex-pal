import { h, hx, bindView, type Component } from '@fun-land/fun-web'
import { funState, type FunState } from '@fun-land/fun-state'
import type { AppState, Build, Tab, TabConfig, Sign } from '../state/app_state'
import { new_id } from '../state/app_state'
import type { Affix, LevelRange } from '../data/types'
import { in_band } from '../solver'
import { tab_solve, concept_affixes } from '../regex'
import { CONCEPTS } from '../concepts'
import { Picker, initial_picker, type PickerState } from './picker'
import * as css from './app.css'

type Props = { readonly app$: FunState<AppState> }

const CONCEPT_LABEL = new Map(CONCEPTS.map((c) => [c.id, c.label]))

const find_build = (s: AppState): Build | undefined => s.builds.find((b) => b.id === s.active_build_id)
const find_tab = (b: Build | undefined, s: AppState): Tab | undefined =>
  b?.tabs.find((t) => t.id === s.active_tab_id)

const range_of = (c: TabConfig): LevelRange => ({
  ...(c.min_level !== null ? { min: c.min_level } : {}),
  ...(c.max_level !== null ? { max: c.max_level } : {}),
})

const parse_level = (v: string): number | null => {
  const t = v.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

const map_active_build = (s: AppState, fn: (b: Build) => Build): AppState => ({
  ...s,
  builds: s.builds.map((b) => (b.id === s.active_build_id ? fn(b) : b)),
})

const update_config = (app$: FunState<AppState>, fn: (c: TabConfig) => TabConfig): void => {
  app$.mod((s) =>
    map_active_build(s, (b) => ({
      ...b,
      tabs: b.tabs.map((t) => (t.id === s.active_tab_id ? { ...t, config: fn(t.config) } : t)),
    })),
  )
}

const blank_tab = (name: string): Tab => ({
  id: new_id(),
  name,
  config: { min_level: null, max_level: null, selections: [] },
})

const switch_build = (app$: FunState<AppState>, id: string): void => {
  app$.mod((s) => {
    const b = s.builds.find((x) => x.id === id)
    return b === undefined ? s : { ...s, active_build_id: id, active_tab_id: b.tabs[0]?.id ?? '' }
  })
}

const add_build = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    const t = blank_tab('Tab 1')
    const b: Build = { id: new_id(), name: 'New Build', tabs: [t] }
    return { ...s, builds: [...s.builds, b], active_build_id: b.id, active_tab_id: t.id }
  })
}

const clone_build = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    const src = find_build(s)
    if (src === undefined) return s
    const tabs = src.tabs.map((t) => ({ ...t, id: new_id() }))
    const b: Build = { id: new_id(), name: `${src.name} (copy)`, tabs }
    return { ...s, builds: [...s.builds, b], active_build_id: b.id, active_tab_id: tabs[0]?.id ?? '' }
  })
}

const delete_build = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    if (s.builds.length <= 1) return s
    const remaining = s.builds.filter((b) => b.id !== s.active_build_id)
    const next = remaining[0]
    if (next === undefined) return s
    return { ...s, builds: remaining, active_build_id: next.id, active_tab_id: next.tabs[0]?.id ?? '' }
  })
}

const add_tab = (app$: FunState<AppState>): void => {
  app$.mod((s) => {
    const t = blank_tab(`Tab ${(find_build(s)?.tabs.length ?? 0) + 1}`)
    return { ...map_active_build(s, (b) => ({ ...b, tabs: [...b.tabs, t] })), active_tab_id: t.id }
  })
}

const select_tab = (app$: FunState<AppState>, t: Tab): void => {
  void navigator.clipboard.writeText(tab_solve(t.config).regex)
  app$.mod((s) => ({ ...s, active_tab_id: t.id }))
}

const add_selection = (app$: FunState<AppState>, concept_id: string, sign: Sign): void => {
  update_config(app$, (c) => ({ ...c, selections: [...c.selections, { concept_id, sign, overrides: {} }] }))
}

const remove_selection = (app$: FunState<AppState>, index: number): void => {
  update_config(app$, (c) => ({ ...c, selections: c.selections.filter((_, i) => i !== index) }))
}

const set_override = (app$: FunState<AppState>, index: number, affix_id: string, checked: boolean): void => {
  update_config(app$, (c) => ({
    ...c,
    selections: c.selections.map((s, i) =>
      i === index ? { ...s, overrides: { ...s.overrides, [affix_id]: checked } } : s,
    ),
  }))
}

const button = (
  region: AbortSignal,
  className: string,
  label: string,
  onclick: () => void,
): HTMLElement => hx('button', { signal: region, props: { className }, on: { click: onclick } }, [label])

const build_bar = (region: AbortSignal, app$: FunState<AppState>, s: AppState): HTMLElement => {
  const options = s.builds.map((b) =>
    h('option', { value: b.id, selected: b.id === s.active_build_id }, [b.name]),
  )
  const select = hx(
    'select',
    {
      signal: region,
      props: { className: css.select },
      on: { change: (e) => switch_build(app$, e.currentTarget.value) },
    },
    options,
  )
  return h('div', { className: css.row }, [
    h('span', { className: css.label }, ['Build:']),
    select,
    button(region, css.btn, 'New', () => add_build(app$)),
    button(region, css.btn, 'Clone', () => clone_build(app$)),
    button(region, css.btn, 'Delete', () => delete_build(app$)),
  ])
}

const tab_strip = (region: AbortSignal, app$: FunState<AppState>, b: Build, s: AppState): HTMLElement => {
  const tabs = b.tabs.map((t) =>
    button(
      region,
      t.id === s.active_tab_id ? `${css.tab} ${css.tab_active}` : css.tab,
      t.name,
      () => select_tab(app$, t),
    ),
  )
  const add = button(region, css.tab, '+', () => add_tab(app$))
  return h('div', { className: css.tab_strip }, [...tabs, add])
}

const affix_checkbox = (
  region: AbortSignal,
  app$: FunState<AppState>,
  index: number,
  affix: Affix,
  checked: boolean,
): HTMLElement => {
  const box = hx('input', {
    signal: region,
    props: { type: 'checkbox', checked },
    on: { change: (e) => set_override(app$, index, affix.id, e.currentTarget.checked) },
  })
  const matches = affix.name === '' ? affix.text : `matches "${affix.name}"`
  return h('label', { className: css.affix_label, title: matches }, [
    box,
    h('span', { className: css.affix_text }, [affix.text]),
    h('span', { className: css.req }, [`lvl ${affix.required_level}`]),
  ])
}

const render_selection = (
  region: AbortSignal,
  app$: FunState<AppState>,
  selection: TabConfig['selections'][number],
  index: number,
  range: LevelRange,
): HTMLElement => {
  const sign_cls = selection.sign === 'include' ? css.sign_include : css.sign_exclude
  const head = h('div', { className: css.selection_head }, [
    h('span', { className: sign_cls }, [selection.sign === 'include' ? 'INCLUDE' : 'EXCLUDE']),
    h('span', { className: css.concept_label }, [CONCEPT_LABEL.get(selection.concept_id) ?? selection.concept_id]),
    button(region, css.btn, '×', () => remove_selection(app$, index)),
  ])
  const boxes = concept_affixes(selection.concept_id).map((a) =>
    affix_checkbox(region, app$, index, a, selection.overrides[a.id] ?? in_band(a, range)),
  )
  return h('div', { className: css.selection }, [head, h('div', { className: css.affix_grid }, boxes)])
}

const builder = (
  region: AbortSignal,
  app$: FunState<AppState>,
  t: Tab,
  picker$: FunState<PickerState>,
): HTMLElement => {
  const c = t.config
  const min_in = hx('input', {
    signal: region,
    props: { type: 'number', className: css.level_input, value: c.min_level === null ? '' : String(c.min_level) },
    on: { change: (e) => update_config(app$, (cfg) => ({ ...cfg, min_level: parse_level(e.currentTarget.value) })) },
  })
  const max_in = hx('input', {
    signal: region,
    props: { type: 'number', className: css.level_input, value: c.max_level === null ? '' : String(c.max_level) },
    on: { change: (e) => update_config(app$, (cfg) => ({ ...cfg, max_level: parse_level(e.currentTarget.value) })) },
  })
  const level_row = h('div', { className: css.row }, [
    h('span', { className: css.label }, ['Level band:']),
    h('span', { className: css.label }, ['min']),
    min_in,
    h('span', { className: css.label }, ['max']),
    max_in,
  ])
  const add_row = h('div', { className: css.row }, [
    button(region, css.btn, 'Add affix…', () =>
      picker$.mod((p) => ({ ...p, open: true, query: '', sign: 'include' })),
    ),
  ])
  const range = range_of(c)
  const selections = c.selections.map((sel, i) => render_selection(region, app$, sel, i, range))
  return h('div', { className: css.builder }, [level_row, add_row, ...selections])
}

const output = (region: AbortSignal, t: Tab): HTMLElement => {
  const result = tab_solve(t.config)
  const counter_cls = result.over_budget ? `${css.counter} ${css.counter_over}` : css.counter
  return h('div', { className: css.output }, [
    h('div', { className: css.regex_box }, [result.regex === '' ? '(nothing selected)' : result.regex]),
    h('div', { className: css.counter_row }, [
      h('span', { className: counter_cls }, [`${result.length} / 250`]),
      button(region, css.btn, 'Copy', () => void navigator.clipboard.writeText(result.regex)),
    ]),
  ])
}

const render_app = (
  region: AbortSignal,
  app$: FunState<AppState>,
  s: AppState,
  picker$: FunState<PickerState>,
): HTMLElement => {
  const b = find_build(s)
  const t = find_tab(b, s)
  const children: Element[] = [
    h('h1', { className: css.heading }, ['POE2 Regex Pal']),
    build_bar(region, app$, s),
  ]
  if (b !== undefined) children.push(tab_strip(region, app$, b, s))
  if (t !== undefined) {
    children.push(builder(region, app$, t, picker$))
    children.push(output(region, t))
  }
  return h('div', { className: css.app }, children)
}

export const App: Component<Props> = (signal, { app$ }) => {
  const picker$ = funState<PickerState>(initial_picker)
  const on_choose = (concept_id: string, sign: Sign): void => add_selection(app$, concept_id, sign)
  const main = bindView(signal, app$, (region, s) => render_app(region, app$, s, picker$))
  return h('div', {}, [main, Picker(signal, { picker$, on_choose })])
}
