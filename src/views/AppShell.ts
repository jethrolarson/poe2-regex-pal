import { bindView, h, hx, renderWhen, type Component } from '@fun-land/fun-web'
import { type FunState, derive } from '@fun-land/fun-state'
import type { AppState } from '../models/AppState/AppState_types'
import { Button } from '../components/Button'
import { read_has_active_tab } from '../models/AppState/AppState_reads'
import {
  add_new_build,
  add_tab,
  clear_data,
  clone_build,
  delete_build,
  import_build,
  rename_active_build,
  rename_active_tab,
  select_tab,
  switch_build,
} from '../models/AppState/AppState_operations'
import { read_build_bar, read_active_tab, read_active_build } from '../models/AppState/AppState_reads'
import { export_build } from '../models/AppState/AppState_persistance'
import { BuilderDeck } from './Builder'
import * as shell from './AppShell.css'
import * as css from './Controls.css'

/** Tab strip layout: reacts when build list / active pointers change */
export const read_tab_strip = (app$: FunState<AppState>) =>
  derive(
    app$.prop('builds'),
    app$.prop('active_build_id'),
    app$.prop('active_tab_id'),
    (builds, active_build_id, active_tab_id) => ({
      build: builds.find((b) => b.id === active_build_id),
      active_tab_id,
    }),
  )

/** Build selector reacts only to builds + active selection; unrelated app edits keep this subtree mounted. */
const BuildBar: Component<{ app$: FunState<AppState> }> = (s, { app$ }) =>
  h('div', { className: css.row }, [
    h('span', { className: css.label }, ['Build:']),
    bindView(s, read_build_bar(app$), (region, snap) =>
      hx(
        'select',
        {
          signal: region,
          props: { className: shell.select },
          on: { change: (e) => switch_build(app$, e.currentTarget.value) },
        },
        snap.options.map((b) => h('option', { value: b.id, selected: b.id === snap.active_build_id }, [b.name])),
      ),
    ),
    BuildName(s, { app$ }),
    Button(s, { label: 'New', onclick: () => add_new_build(app$) }),
    Button(s, { label: 'Clone', onclick: () => clone_build(app$) }),
    Button(s, {
      label: 'Delete',
      onclick: () => {
        if (window.confirm('Delete this build?')) delete_build(app$)
      },
    }),
    Button(s, {
      label: 'Export',
      onclick: () => void navigator.clipboard.writeText(export_build(app$.get())),
    }),
    Button(s, {
      label: 'Import',
      onclick: () => {
        const json = window.prompt('Paste build JSON:')
        if (json !== null && json.trim() !== '' && !import_build(app$, json)) {
          window.alert('Invalid build JSON')
        }
      },
    }),
    Button(s, {
      label: 'Clear data',
      onclick: () => {
        if (window.confirm('Clear all builds and reset to default? This cannot be undone.')) clear_data(app$)
      },
    }),
  ])

/** Build-name field: keyed on active_build_id so it refreshes on switch but keeps focus while typing. */
const BuildName: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  bindView(signal, read_active_build(app$), (region, build) => hx('input', {
    signal: region,
    props: { className: css.name_input, type: 'text', value: build?.name ?? '', placeholder: 'Build name' },
    on: { input: (e) => rename_active_build(app$, e.currentTarget.value) },
  })
  )

/** Tab-name field: keyed on active_tab_id (not tab content) so typing doesn't lose focus. */
const TabName: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  bindView(signal, read_active_tab(app$), (region, tab) => tab === undefined
    ? h('span', { hidden: true })
    : h('div', { className: css.row }, [
      h('span', { className: css.label }, ['Tab name:']),
      hx('input', {
        signal: region,
        props: { className: css.name_input, type: 'text', value: tab.name, placeholder: 'Tab name' },
        on: { input: (e) => rename_active_tab(app$, e.currentTarget.value) },
      }),
    ])
  )

/** Tab strip uses `renderWhen` at call site; inner `bindView` updates rows without rebuilding static chrome. */
const TabStrip: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  bindView(signal, read_tab_strip(app$), (region, { build, active_tab_id }) =>
    build === undefined
      ? h('span', { hidden: true })
      : h('div', { className: shell.tab_strip }, [
        ...build.tabs.map((t) =>
          hx('button', { signal: region, props: { className: t.id === active_tab_id ? `${shell.tab} ${shell.tab_active}` : shell.tab }, on: { click: () => select_tab(app$, t) } }, [t.name]),
        ),
        hx('button', { signal: region, props: { className: shell.tab }, on: { click: () => add_tab(app$) } }, ['+']),
      ]),
  )

export const AppShell: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  h('div', { className: shell.app }, [
    h('h1', { className: shell.heading }, ['POE2 Regex Pal']),
    BuildBar(signal, { app$ }),
    TabStrip(signal, { app$ }),
    TabName(signal, { app$ }),
    renderWhen({
      signal,
      state: read_has_active_tab(app$),
      component: BuilderDeck,
      props: { app$ },
    }),
  ])
