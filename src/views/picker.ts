import { h, hx, bindView, bindClass, type Component } from '@fun-land/fun-web'
import { mapRead, type FunState } from '@fun-land/fun-state'
import type { Sign } from '../state/app_state'
import type { Concept } from '../data/types'
import { CONCEPTS, FEATURED } from '../concepts'
import { search_concepts, concept_sample } from '../regex'
import * as css from './picker.css'

export type PickerState = {
  readonly open: boolean
  readonly query: string
  readonly sign: Sign
  readonly view: 'featured' | 'all'
}
export const initial_picker: PickerState = { open: false, query: '', sign: 'include', view: 'featured' }

const ALL_CONCEPTS = [...CONCEPTS].sort((a, b) => a.label.localeCompare(b.label))

type Props = {
  readonly picker$: FunState<PickerState>
  readonly on_choose: (concept_id: string, sign: Sign) => void
  readonly is_added: (concept_id: string) => boolean
}

const concept_by_id = new Map(CONCEPTS.map((c) => [c.id, c]))

const close = (picker$: FunState<PickerState>): void => picker$.mod((p) => ({ ...p, open: false, query: '' }))

const row = (
  region: AbortSignal,
  picker$: FunState<PickerState>,
  on_choose: Props['on_choose'],
  concept: Concept,
): HTMLElement =>
  hx(
    'div',
    {
      signal: region,
      props: { className: css.row },
      on: {
        click: () => {
          on_choose(concept.id, picker$.get().sign)
          close(picker$)
        },
      },
    },
    [
      h('span', { className: css.row_label }, [concept.label]),
      h('span', { className: css.row_effect }, [concept_sample(concept.id)]),
    ],
  )

const browse_toggle = (region: AbortSignal, picker$: FunState<PickerState>, view: PickerState['view']): HTMLElement =>
  hx(
    'div',
    {
      signal: region,
      props: { className: css.browse_toggle },
      on: { click: () => picker$.mod((p) => ({ ...p, view: p.view === 'all' ? 'featured' : 'all' })) },
    },
    [view === 'all' ? '← Featured' : `Browse all (${ALL_CONCEPTS.length}) →`],
  )

const render_results = (
  region: AbortSignal,
  picker$: FunState<PickerState>,
  on_choose: Props['on_choose'],
  is_added: Props['is_added'],
): HTMLElement => {
  const { query, view } = picker$.get()
  const q = query.trim()
  const available = (c: Concept): boolean => !is_added(c.id)
  if (q !== '') {
    const matches = search_concepts(q).filter(available).slice(0, 60)
    if (matches.length === 0) return h('div', { className: css.empty }, ['No matches'])
    return h('div', {}, matches.map((c) => row(region, picker$, on_choose, c)))
  }
  if (view === 'all') {
    return h('div', {}, [
      browse_toggle(region, picker$, view),
      ...ALL_CONCEPTS.filter(available).map((c) => row(region, picker$, on_choose, c)),
    ])
  }
  const sections = FEATURED.map((section) => ({
    title: section.title,
    concepts: section.concept_ids
      .map((id) => concept_by_id.get(id))
      .filter((c): c is Concept => c !== undefined && available(c)),
  })).filter((s) => s.concepts.length > 0)
  return h('div', {}, [
    ...sections.map((section) =>
      h('div', {}, [
        h('div', { className: css.section_title }, [section.title]),
        ...section.concepts.map((c) => row(region, picker$, on_choose, c)),
      ]),
    ),
    browse_toggle(region, picker$, view),
  ])
}

const mode_toggle = (region: AbortSignal, picker$: FunState<PickerState>): HTMLElement =>
  bindView(region, mapRead(picker$, (p) => p.sign), (r, sign) =>
    h('div', { className: css.mode }, [
      hx('button', {
        signal: r,
        props: { className: sign === 'include' ? `${css.mode_btn} ${css.mode_active}` : css.mode_btn },
        on: { click: () => picker$.mod((p) => ({ ...p, sign: 'include' })) },
      }, ['Include']),
      hx('button', {
        signal: r,
        props: { className: sign === 'exclude' ? `${css.mode_btn} ${css.mode_active}` : css.mode_btn },
        on: { click: () => picker$.mod((p) => ({ ...p, sign: 'exclude' })) },
      }, ['Exclude']),
    ]),
  )

export const Picker: Component<Props> = (signal, { picker$, on_choose, is_added }) => {
  const input = hx('input', {
    signal,
    props: { className: css.search, type: 'text', placeholder: 'Search affixes…' },
    on: { input: (e) => picker$.mod((p) => ({ ...p, query: e.currentTarget.value })) },
  })

  const results = bindView(
    signal,
    mapRead(picker$, (p) => `${p.open ? '1' : '0'} ${p.view} ${p.query}`),
    (region) => render_results(region, picker$, on_choose, is_added),
  )

  const panel = hx(
    'div',
    { signal, props: { className: css.panel }, on: { click: (e) => e.stopPropagation() } },
    [h('div', { className: css.header }, [input, mode_toggle(signal, picker$)]), h('div', { className: css.results }, [results])],
  )

  const backdrop = hx(
    'div',
    { signal, props: { className: css.backdrop }, on: { click: () => close(picker$) } },
    [panel],
  )
  bindClass(css.open, mapRead(picker$, (p) => p.open), signal)(backdrop)

  picker$.watch(signal, (p) => {
    if (p.open) setTimeout(() => input.focus(), 0)
  })
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') close(picker$)
    },
    { signal },
  )

  return backdrop
}
