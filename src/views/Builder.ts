import { mapRead, type FunState } from '@fun-land/fun-state'
import { bindView, bindListChildren, h, hx, type Component } from '@fun-land/fun-web'
import { Acc } from '@fun-land/accessor'
import { Button } from '../components/Button'
import { copy_to_clipboard } from '../clipboard'
import type { AppState } from '../models/AppState/AppState_types'
import type { TabConfig, ConceptSelection } from '../models/TabConfig/TabConfig_types'
import type { Affix } from '../models/Affix/Affix'
import { concept_affixes, tab_solve } from '../models/Regex/Regex_operations'
import { CONCEPTS } from '../models/Concept/Concept_operations'
import type { Concept } from '../models/Concept/Concept_types'
import * as bcss from './Builder.css'
import * as ctrl from './Controls.css'
import { apply_level_range, set_all_overrides, set_override } from '../models/TabConfig/TabConfig_operations'
import { read_has_active_tab } from '../models/AppState/AppState_reads'

const CONCEPT_MAP = new Map<string, Concept>(CONCEPTS.map((c) => [c.id, c]))

const AFFIX_COLUMNS = 2

const affix_rows = <T,>(items: readonly T[]): T[][] => {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += AFFIX_COLUMNS) {
    rows.push(items.slice(i, i + AFFIX_COLUMNS))
  }
  return rows
}

const AffixCheckbox: Component<{
  readonly selection$: FunState<ConceptSelection>
  readonly affix: Affix
}> = (signal, { selection$, affix }) => {
  const box = hx('input', {
    signal,
    props: { type: 'checkbox' },
    bind: { checked: mapRead(selection$.prop('overrides'), (o) => o?.[affix.id] ?? false) },
    on: { change: (e) => set_override(selection$, affix.id, e.currentTarget.checked) },
  })
  const is_implicit = affix.gen_type === 'implicit'
  const matches = affix.name === '' ? affix.text : `matches "${affix.name}"`
  // Implicits don't have a tier level of their own; their level belongs to the
  // item base that carries them, so a tier-style "lvl N" would be misleading.
  const req = is_implicit ? 'implicit' : `lvl ${affix.required_level}`
  return h('label', { className: bcss.affix_label, title: matches }, [
    box,
    h('span', { className: bcss.affix_text }, [affix.text]),
    h('span', { className: bcss.req }, [req]),
  ])
}

const LevelSelect: Component<{
  readonly selection$: FunState<ConceptSelection>
  readonly which: 'min' | 'max'
  readonly levels: readonly number[]
}> = (signal, { selection$, which, levels }) => {
  const sel = selection$.get()
  const current = which === 'min' ? sel.min_level : sel.max_level
  const options = [
    h('option', { value: '', selected: current === null }, ['Any']),
    ...levels.map((lvl) => h('option', { value: String(lvl), selected: current === lvl }, [String(lvl)])),
  ]
  return hx(
    'select',
    {
      signal,
      props: { className: bcss.level_input },
      on: {
        change: (e) => {
          const v = e.currentTarget.value === '' ? null : Number(e.currentTarget.value)
          const cur = selection$.get()
          apply_level_range(selection$, which === 'min' ? v : cur.min_level, which === 'max' ? v : cur.max_level)
        },
      },
    },
    options,
  )
}

const Selection: Component<{
  readonly selection$: FunState<ConceptSelection>
  readonly remove: () => void
}> = (signal, { selection$, remove }) => {
  const sel = selection$.get()
  const concept = CONCEPT_MAP.get(sel.concept_id)
  const sign_cls = sel.sign === 'include' ? bcss.sign_include : bcss.sign_exclude
  const sign_label = sel.sign === 'include' ? 'INCLUDE' : 'EXCLUDE'
  const label = concept?.label ?? sel.concept_id

  if (concept?.kind === 'regex') {
    return h('div', { className: bcss.selection }, [
      h('div', { className: bcss.selection_head }, [
        h('span', { className: sign_cls }, [sign_label]),
        h('span', { className: bcss.concept_label }, [label]),
        h('span', { className: bcss.pseudo_tag }, ['PSEUDO']),
        Button(signal, { label: '×', size: 'small', onclick: remove }),
      ]),
    ])
  }

  const affixes = concept_affixes(sel.concept_id)
  const affix_ids = affixes.map((a) => a.id)
  const levels = [...new Set(affixes.map((a) => a.required_level))].sort((a, b) => a - b)
  const head = h('div', { className: bcss.selection_head }, [
    h('span', { className: sign_cls }, [sign_label]),
    h('span', { className: bcss.concept_label }, [label]),
    h('span', { className: ctrl.label }, 'Select:'),
    Button(signal, { label: 'All', size: 'small', onclick: () => set_all_overrides(selection$, affix_ids, true) }),
    Button(signal, { label: 'None', size: 'small', onclick: () => set_all_overrides(selection$, affix_ids, false) }),
    h('span', { className: ctrl.label }, ['by lvl']),
    LevelSelect(signal, { selection$, which: 'min', levels }),
    h('span', { className: ctrl.label }, ['–']),
    LevelSelect(signal, { selection$, which: 'max', levels }),
    Button(signal, { label: '×', size: 'small', onclick: remove }),
  ])
  const grid = h(
    'div',
    { className: bcss.affix_grid },
    affix_rows(affixes).map((row) =>
      h(
        'div',
        { className: bcss.affix_row },
        row.map((a) => AffixCheckbox(signal, { selection$, affix: a })),
      ),
    ),
  )
  return h('div', { className: bcss.selection }, [head, grid])
}

const SelectionList: Component<{ readonly config$: FunState<TabConfig> }> = (signal, { config$ }) =>
  bindListChildren({
    signal,
    state: config$.prop('selections'),
    key: Acc<ConceptSelection>().prop('id'),
    row: ({ signal: row_signal, state, remove }) => Selection(row_signal, { selection$: state, remove }),
  })(h('div', { className: bcss.builder }))

const AddRow: Component<{ readonly open_picker: () => void }> = (signal, { open_picker }) =>
  h('div', { className: ctrl.row }, [
    Button(signal, { label: 'Add affix…', onclick: open_picker }),
  ])

export const Output: Component<{
  readonly config: TabConfig
  readonly on_regex_copied: () => void
}> = (signal, { config, on_regex_copied }) => {
  const result = tab_solve(config)
  const counter_cls = result.over_budget ? `${bcss.counter} ${bcss.counter_over}` : bcss.counter
  const copy_regex = (): void => copy_to_clipboard(result.regex, on_regex_copied)
  const has_regex = result.regex !== ''
  const regex_display = has_regex ? result.regex : '(nothing selected)'
  const regex_cls = has_regex ? `${bcss.regex_box} ${bcss.regex_box_copyable}` : bcss.regex_box
  return h('div', { className: bcss.output }, [
    h('div', { className: bcss.counter_row }, [
      h('span', { className: counter_cls }, [`${result.length} / 250`]),
      Button(signal, {
        label: 'Copy',
        onclick: copy_regex,
      }),
    ]),
    hx(
      'div',
      {
        signal,
        props: { className: regex_cls },
        attrs: has_regex ? { title: 'Click to copy' } : {},
        on: has_regex ? { click: copy_regex } : {},
      },
      [regex_display],
    ),
  ])
}

export const BuilderDeck: Component<{
  readonly app$: FunState<AppState>
  readonly active_config$: FunState<TabConfig>
  readonly open_picker: () => void
  readonly on_regex_copied: () => void
}> = (signal, { app$, active_config$, open_picker, on_regex_copied }) =>
  bindView(signal, read_has_active_tab(app$), (region, has) =>
    has
      ? h('div', { className: bcss.deck }, [
          bindView(region, active_config$, (r, config) => Output(r, { config, on_regex_copied })),
          AddRow(region, { open_picker }),
          SelectionList(region, { config$: active_config$ }),
        ])
      : h('span', { hidden: true }),
  )
