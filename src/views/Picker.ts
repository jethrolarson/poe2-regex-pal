import { h, hx, bindView, bindClass, type Component } from '@fun-land/fun-web'
import { derive, funState, mapRead, merge, type FunState } from '@fun-land/fun-state'
import type { AppState, Sign } from '../state/app_state'
import type { Concept } from '../data/types'
import { CONCEPTS, FEATURED } from '../concepts'
import { search_concepts, concept_sample } from '../regex'
import * as css from './Picker.css'

/** Ephemeral picker UI fields — modal visibility lives on `AppState.picker_open` */
type PickerFields = {
  readonly query: string
  readonly sign: Sign
  readonly view: 'featured' | 'all'
}

const initial_picker_fields: PickerFields = { query: '', sign: 'include', view: 'featured' }

const ALL_CONCEPTS = [...CONCEPTS].sort((a, b) => a.label.localeCompare(b.label))

type Props = {
  readonly app$: FunState<AppState>
  readonly on_choose: (concept_id: string, sign: Sign) => void
  readonly is_added: (concept_id: string) => boolean
}

const concept_by_id = new Map(CONCEPTS.map((c) => [c.id, c]))

/** Close modal (`AppState`) and reset local picker fields together */
const close_modal = (app$: FunState<AppState>, fields$: FunState<PickerFields>): void => {
  merge(app$)({ picker_open: false })
  fields$.set(initial_picker_fields)
}

type FieldProps = {
  readonly fields$: FunState<PickerFields>
}

const ConceptRow: Component<{
  readonly app$: FunState<AppState>
  readonly fields$: FunState<PickerFields>
  readonly on_choose: Props['on_choose']
  readonly concept: Concept
}> = (signal, { app$, fields$, on_choose, concept }) =>
  hx(
    'div',
    {
      signal,
      props: { className: css.row },
      on: {
        click: () => {
          on_choose(concept.id, fields$.get().sign)
          close_modal(app$, fields$)
        },
      },
    },
    [
      h('span', { className: css.row_label }, [concept.label]),
      h('span', { className: css.row_effect }, [concept_sample(concept.id)]),
    ],
  )

const BrowseToggle: Component<FieldProps & { readonly view: PickerFields['view'] }> = (signal, { fields$, view }) =>
  hx(
    'div',
    {
      signal,
      props: { className: css.browse_toggle },
      on: {
        click: () =>
          fields$.mod((f) => ({ ...f, view: f.view === 'all' ? 'featured' : 'all' })),
      },
    },
    [view === 'all' ? '← Featured' : `Browse all (${ALL_CONCEPTS.length}) →`],
  )

type BodyProps = Props & FieldProps

const FeaturedBody: Component<BodyProps> = (signal, body_props) => {
  const { fields$, app$, on_choose, is_added } = body_props
  const available = (c: Concept): boolean => !is_added(c.id)
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
        ...section.concepts.map((c) =>
          ConceptRow(signal, { app$, fields$, on_choose, concept: c }),
        ),
      ]),
    ),
    BrowseToggle(signal, { fields$, view: 'featured' }),
  ])
}

const BrowseAllBody: Component<BodyProps> = (signal, body_props) => {
  const { fields$, app$, on_choose, is_added } = body_props
  const available = (c: Concept): boolean => !is_added(c.id)
  return h('div', {}, [
    BrowseToggle(signal, { fields$, view: 'all' }),
    ...ALL_CONCEPTS.filter(available).map((c) =>
      ConceptRow(signal, { app$, fields$, on_choose, concept: c }),
    ),
  ])
}

const SearchHits: Component<BodyProps & { readonly matches: readonly Concept[] }> = (signal, { matches, app$, fields$, on_choose }) =>
  matches.length === 0
    ? h('div', { className: css.empty }, ['No matches'])
    : h(
        'div',
        {},
        matches.map((c) => ConceptRow(signal, { app$, fields$, on_choose, concept: c })),
      )

const ModeToggle: Component<FieldProps> = (signal, { fields$ }) =>
  bindView(signal, mapRead(fields$, (f) => f.sign), (r, sign) =>
    h('div', { className: css.mode }, [
      hx('button', {
        signal: r,
        props: { className: sign === 'include' ? `${css.mode_btn} ${css.mode_active}` : css.mode_btn },
        on: { click: () => fields$.mod((f0) => ({ ...f0, sign: 'include' })) },
      }, ['Include']),
      hx('button', {
        signal: r,
        props: { className: sign === 'exclude' ? `${css.mode_btn} ${css.mode_active}` : css.mode_btn },
        on: { click: () => fields$.mod((f0) => ({ ...f0, sign: 'exclude' })) },
      }, ['Exclude']),
    ]),
  )

const SearchInput: Component<FieldProps> = (signal, { fields$ }) =>
  hx('input', {
    signal,
    props: {
      className: css.search,
      type: 'text',
      placeholder: 'Search affixes…',
    },
    attrs: { 'data-picker-search': 'true' },
    on: { input: (e) => fields$.mod((f) => ({ ...f, query: e.currentTarget.value })) },
  })

const PickerHeader: Component<FieldProps> = (signal, { fields$ }) =>
  h('div', { className: css.header }, [SearchInput(signal, { fields$ }), ModeToggle(signal, { fields$ })])

const render_results_body = (signal: AbortSignal, picker_props: BodyProps): Element => {
  const { query, view } = picker_props.fields$.get()
  const q = query.trim()
  if (q !== '') {
    const matches = search_concepts(q).filter((c) => !picker_props.is_added(c.id)).slice(0, 60)
    return SearchHits(signal, { ...picker_props, matches })
  }
  if (view === 'all') return BrowseAllBody(signal, picker_props)
  return FeaturedBody(signal, picker_props)
}

const results_bind_key = (app$: FunState<AppState>, fields$: FunState<PickerFields>) =>
  derive(
    app$.prop('picker_open'),
    fields$,
    (open, f) => (open ? `${f.view} ${f.query}` : '—'),
  )

const PickerResults: Component<BodyProps> = (signal, body_props) =>
  bindView(
    signal,
    results_bind_key(body_props.app$, body_props.fields$),
    (region) => render_results_body(region, body_props),
  )

export const Picker: Component<Props> = (signal, props) => {
  const { app$ } = props
  const fields$ = funState<PickerFields>(initial_picker_fields)

  let prev_open = false
  app$.watch(signal, (s) => {
    if (s.picker_open && !prev_open) {
      fields$.set(initial_picker_fields)
    }
    prev_open = s.picker_open
  })

  const body_props: BodyProps = { ...props, fields$ }

  const results = PickerResults(signal, body_props)

  const panel = hx(
    'div',
    { signal, props: { className: css.panel }, on: { click: (e) => e.stopPropagation() } },
    [PickerHeader(signal, { fields$ }), h('div', { className: css.results }, [results])],
  )

  const backdrop = hx(
    'div',
    {
      signal,
      props: { className: css.backdrop },
      on: { click: () => close_modal(app$, fields$) },
    },
    [panel],
  )

  bindClass(css.open, mapRead(app$, (s) => s.picker_open), signal)(backdrop)

  app$.watch(signal, (s) => {
    if (!s.picker_open) return
    queueMicrotask(() => {
      if (signal.aborted || !app$.get().picker_open) return
      const el = backdrop.querySelector<HTMLInputElement>('[data-picker-search="true"]')
      el?.focus()
    })
  })

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape') return
      if (!app$.get().picker_open) return
      close_modal(app$, fields$)
    },
    { signal },
  )

  return backdrop
}
