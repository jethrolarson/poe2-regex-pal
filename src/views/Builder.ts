import type { FunState } from '@fun-land/fun-state'
import { bindView, h, hx, type Component } from '@fun-land/fun-web'
import { Button } from '../components/Button'
import type { AppState } from '../models/AppState/AppState_types'
import { TAB_LEVEL_MAX, TAB_LEVEL_MIN, type TabConfig } from '../models/TabConfig/TabConfig_types'
import type { Affix } from '../models/Affix/Affix'
import type { LevelRange } from '../models/Regex/Regex_types'
import { concept_affixes, tab_solve } from '../models/Regex/Regex_operations'
import { in_band } from '../models/Regex/solver'
import { CONCEPTS } from '../models/Concept/Concept_operations'
import * as bcss from './Builder.css'
import * as ctrl from './Controls.css'
import { active_tab_config_acc, open_picker } from '../models/AppState/AppState_operations'
import { remove_selection, set_all_overrides, set_override } from '../models/TabConfig/TabConfig_operations'
import { read_active_tab } from '../models/AppState/AppState_reads'

const CONCEPT_LABEL = new Map(CONCEPTS.map((c) => [c.id, c.label]))

const range_of = (c: TabConfig): LevelRange => ({
  ...(c.min_level !== null ? { min: c.min_level } : {}),
  ...(c.max_level !== null ? { max: c.max_level } : {}),
})

const parse_level = (v: string): number | null => {
  const t = v.trim()
  if (t === '') return null
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.max(TAB_LEVEL_MIN, Math.min(TAB_LEVEL_MAX, Math.trunc(n)))
}

const AffixCheckbox: Component<{
  readonly config$: FunState<TabConfig>
  readonly index: number
  readonly affix: Affix
  readonly checked: boolean
}> = (signal, { config$, index, affix, checked }) => {
  const box = hx('input', {
    signal,
    props: { type: 'checkbox', checked },
    on: { change: (e) => set_override(config$, index, affix.id, e.currentTarget.checked) },
  })
  const matches = affix.name === '' ? affix.text : `matches "${affix.name}"`
  return h('label', { className: bcss.affix_label, title: matches }, [
    box,
    h('span', { className: bcss.affix_text }, [affix.text]),
    h('span', { className: bcss.req }, [`lvl ${affix.required_level}`]),
  ])
}

const Selection: Component<{
  readonly config$: FunState<TabConfig>
  readonly selection: TabConfig['selections'][number]
  readonly index: number
  readonly range: LevelRange
}> = (signal, { config$, selection, index, range }) => {
  const sign_cls = selection.sign === 'include' ? bcss.sign_include : bcss.sign_exclude
  const affixes = concept_affixes(selection.concept_id)
  const affix_ids = affixes.map((a) => a.id)
  const head = h('div', { className: bcss.selection_head }, [
    h('span', { className: sign_cls }, [selection.sign === 'include' ? 'INCLUDE' : 'EXCLUDE']),
    h('span', { className: bcss.concept_label }, [CONCEPT_LABEL.get(selection.concept_id) ?? selection.concept_id]),
    Button(signal, { label: 'All', onclick: () => set_all_overrides(config$, index, affix_ids, true) }),
    Button(signal, { label: 'None', onclick: () => set_all_overrides(config$, index, affix_ids, false) }),
    Button(signal, { label: '×', onclick: () => remove_selection(config$, index) }),
  ])
  const boxes = affixes.map((a) =>
    AffixCheckbox(signal, {
      config$,
      index,
      affix: a,
      checked: selection.overrides[a.id] ?? in_band(a, range),
    }),
  )
  return h('div', { className: bcss.selection }, [head, h('div', { className: bcss.affix_grid }, boxes)])
}

export const Builder: Component<{
  readonly config$: FunState<TabConfig>
  readonly on_open_picker: () => void
}> = (signal, { config$, on_open_picker }) => {
  const c = config$.get()
  const level_row = h('div', { className: ctrl.row }, [
    h('span', { className: ctrl.label }, ['Select by level:']),
    hx('input', { signal, props: { className: bcss.level_input, type: 'number', value: String(c.min_level ?? ''), min: String(TAB_LEVEL_MIN), max: String(TAB_LEVEL_MAX) }, on: { change: (e) => config$.prop('min_level').set(parse_level(e.currentTarget.value)) } }),
    h('span', { className: ctrl.label }, ['to']),
    hx('input', { signal, props: { className: bcss.level_input, type: 'number', value: String(c.max_level ?? ''), min: String(TAB_LEVEL_MIN), max: String(TAB_LEVEL_MAX) }, on: { change: (e) => config$.prop('max_level').set(parse_level(e.currentTarget.value)) } }),
  ])
  const add_row = h('div', { className: ctrl.row }, [
    Button(signal, {
      label: 'Add affix…',
      onclick: on_open_picker,
    }),
  ])
  const selections = c.selections.map((sel, i) =>
    Selection(signal, { config$, selection: sel, index: i, range: range_of(c) }),
  )
  return h('div', { className: bcss.builder }, [level_row, add_row, ...selections])
}

export const Output: Component<{ readonly config: TabConfig }> = (signal, { config }) => {
  const result = tab_solve(config)
  const counter_cls = result.over_budget ? `${bcss.counter} ${bcss.counter_over}` : bcss.counter
  return h('div', { className: bcss.output }, [
    h('div', { className: bcss.counter_row }, [
      h('span', { className: counter_cls }, [`${result.length} / 250`]),
      Button(signal, {
        label: 'Copy',
        onclick: () => void navigator.clipboard.writeText(result.regex),
      }),
    ]),
    h('div', { className: bcss.regex_box }, [result.regex === '' ? '(nothing selected)' : result.regex]),
  ])
}

export const BuilderDeck: Component<{
  readonly app$: FunState<AppState>
}> = (signal, { app$ }) => {
  const config$ = app$.focus(active_tab_config_acc)
  const on_open_picker = (): void => open_picker(app$)

  return bindView(signal, read_active_tab(app$), (region, tab) =>
    tab === undefined
      ? h('span', { hidden: true })
      : bindView(region, config$, (deck_region, config) =>
        h('div', { className: bcss.deck }, [
          Output(deck_region, { config }),
          Builder(deck_region, { config$, on_open_picker }),
        ]),
      ),
  )
}
