import type { FunState } from '@fun-land/fun-state'
import { bindView, h, hx, type Component } from '@fun-land/fun-web'
import { AppButton } from './app_button'
import type { AppState, Tab, TabConfig } from '../state/app_state'
import type { Affix, LevelRange } from '../data/types'
import { in_band } from '../solver'
import { tab_solve, concept_affixes } from '../regex'
import { CONCEPTS } from '../concepts'
import * as bcss from './Builder.css'
import * as ctrl from './Controls.css'
import { open_picker, remove_selection, set_all_overrides, set_override } from './app_ops'
import { update_config } from './app_optics'
import { read_active_tab } from './app_reads'

const CONCEPT_LABEL = new Map(CONCEPTS.map((c) => [c.id, c.label]))

const range_of = (c: TabConfig): LevelRange => ({
  ...(c.min_level !== null ? { min: c.min_level } : {}),
  ...(c.max_level !== null ? { max: c.max_level } : {}),
})

const parse_level = (v: string): number | null => {
  const t = v.trim()
  if (t === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

const AffixCheckbox: Component<{
  readonly app$: FunState<AppState>
  readonly index: number
  readonly affix: Affix
  readonly checked: boolean
}> = (signal, { app$, index, affix, checked }) => {
  const box = hx('input', {
    signal,
    props: { type: 'checkbox', checked },
    on: { change: (e) => set_override(app$, index, affix.id, e.currentTarget.checked) },
  })
  const matches = affix.name === '' ? affix.text : `matches "${affix.name}"`
  return h('label', { className: bcss.affix_label, title: matches }, [
    box,
    h('span', { className: bcss.affix_text }, [affix.text]),
    h('span', { className: bcss.req }, [`lvl ${affix.required_level}`]),
  ])
}

const Selection: Component<{
  readonly app$: FunState<AppState>
  readonly selection: TabConfig['selections'][number]
  readonly index: number
  readonly range: LevelRange
}> = (signal, { app$, selection, index, range }) => {
  const sign_cls = selection.sign === 'include' ? bcss.sign_include : bcss.sign_exclude
  const affixes = concept_affixes(selection.concept_id)
  const affix_ids = affixes.map((a) => a.id)
  const head = h('div', { className: bcss.selection_head }, [
    h('span', { className: sign_cls }, [selection.sign === 'include' ? 'INCLUDE' : 'EXCLUDE']),
    h('span', { className: bcss.concept_label }, [CONCEPT_LABEL.get(selection.concept_id) ?? selection.concept_id]),
    AppButton(signal, { className: ctrl.btn, label: 'All', onclick: () => set_all_overrides(app$, index, affix_ids, true) }),
    AppButton(signal, { className: ctrl.btn, label: 'None', onclick: () => set_all_overrides(app$, index, affix_ids, false) }),
    AppButton(signal, { className: ctrl.btn, label: '×', onclick: () => remove_selection(app$, index) }),
  ])
  const boxes = affixes.map((a) =>
    AffixCheckbox(signal, { app$, index, affix: a, checked: selection.overrides[a.id] ?? in_band(a, range) }),
  )
  return h('div', { className: bcss.selection }, [head, h('div', { className: bcss.affix_grid }, boxes)])
}

export const Builder: Component<{
  readonly app$: FunState<AppState>
  readonly tab: Tab
}> = (signal, { app$, tab }) => {
  const c = tab.config
  const level_input = (value: number | null, set: (v: number | null) => void): HTMLElement =>
    hx('input', {
      signal,
      props: { type: 'number', className: bcss.level_input, value: value === null ? '' : String(value) },
      on: { change: (e) => set(parse_level(e.currentTarget.value)) },
    })
  const level_row = h('div', { className: ctrl.row }, [
    h('span', { className: ctrl.label }, ['Level band:']),
    h('span', { className: ctrl.label }, ['min']),
    level_input(c.min_level, (v) => update_config(app$, (cfg) => ({ ...cfg, min_level: v }))),
    h('span', { className: ctrl.label }, ['max']),
    level_input(c.max_level, (v) => update_config(app$, (cfg) => ({ ...cfg, max_level: v }))),
  ])
  const add_row = h('div', { className: ctrl.row }, [
    AppButton(signal, {
      className: ctrl.btn,
      label: 'Add affix…',
      onclick: () => open_picker(app$),
    }),
  ])
  const range = range_of(c)
  const selections = c.selections.map((sel, i) => Selection(signal, { app$, selection: sel, index: i, range }))
  return h('div', { className: bcss.builder }, [level_row, add_row, ...selections])
}

export const Output: Component<{ readonly tab: Tab }> = (signal, { tab }) => {
  const result = tab_solve(tab.config)
  const counter_cls = result.over_budget ? `${bcss.counter} ${bcss.counter_over}` : bcss.counter
  return h('div', { className: bcss.output }, [
    h('div', { className: bcss.regex_box }, [result.regex === '' ? '(nothing selected)' : result.regex]),
    h('div', { className: bcss.counter_row }, [
      h('span', { className: counter_cls }, [`${result.length} / 250`]),
      AppButton(signal, {
        className: ctrl.btn,
        label: 'Copy',
        onclick: () => void navigator.clipboard.writeText(result.regex),
      }),
    ]),
  ])
}

export const BuilderDeck: Component<{
  readonly app$: FunState<AppState>
}> = (signal, { app$ }) =>
  bindView(signal, read_active_tab(app$), (region, tab) =>
    tab === undefined
      ? h('span', { hidden: true })
      : h('div', { style: { display: 'contents' } }, [
          Builder(region, { app$, tab }),
          Output(region, { tab }),
        ]),
  )
