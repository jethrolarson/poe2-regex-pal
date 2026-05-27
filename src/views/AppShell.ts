import { bindView, h, hx, renderWhen, type Component } from '@fun-land/fun-web'
import { type FunState, derive } from '@fun-land/fun-state'
import type { AppState } from '../state/app_state'
import { AppButton } from './app_button'
import { read_has_active_build, read_has_active_tab } from './app_reads'
import { add_build, add_tab, clone_build, delete_build, select_tab, switch_build } from './app_ops'
import { BuilderDeck } from './Builder'
import * as shell from './AppShell.css'
import * as ctrl from './Controls.css'

/** Build dropdown + toolbar: reacts only when `builds` or `active_build_id` change */
export const read_build_bar = (app$: FunState<AppState>) =>
  derive(
    app$.prop('builds'),
    app$.prop('active_build_id'),
    (builds, active_build_id) => ({
      active_build_id,
      options: builds.map((b) => ({ id: b.id, name: b.name })),
    }),
  )

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

const build_bar_slice = (app$: FunState<AppState>) => read_build_bar(app$)

const tab_strip_slice = (app$: FunState<AppState>) => read_tab_strip(app$)

/** Build selector reacts only to builds + active selection; unrelated app edits keep this subtree mounted. */
const BuildBar: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  h('div', { className: ctrl.row }, [
    h('span', { className: ctrl.label }, ['Build:']),
    bindView(signal, build_bar_slice(app$), (region, snap) =>
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
    AppButton(signal, { className: ctrl.btn, label: 'New', onclick: () => add_build(app$) }),
    AppButton(signal, { className: ctrl.btn, label: 'Clone', onclick: () => clone_build(app$) }),
    AppButton(signal, { className: ctrl.btn, label: 'Delete', onclick: () => delete_build(app$) }),
  ])

/** Tab strip uses `renderWhen` at call site; inner `bindView` updates rows without rebuilding static chrome. */
const TabStrip: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  bindView(signal, tab_strip_slice(app$), (region, { build, active_tab_id }) =>
    build === undefined
      ? h('span', { hidden: true })
      : h('div', { className: shell.tab_strip }, [
        ...build.tabs.map((t) =>
          AppButton(region, {
            className: t.id === active_tab_id ? `${shell.tab} ${shell.tab_active}` : shell.tab,
            label: t.name,
            onclick: () => select_tab(app$, t),
          }),
        ),
        AppButton(region, { className: shell.tab, label: '+', onclick: () => add_tab(app$) }),
      ]),
  )

export const AppShell: Component<{ app$: FunState<AppState> }> = (signal, { app$ }) =>
  h('div', { className: shell.app }, [
    h('h1', { className: shell.heading }, ['POE2 Regex Pal']),
    BuildBar(signal, { app$ }),
    renderWhen({
      signal,
      state: read_has_active_build(app$),
      component: TabStrip,
      props: { app$ },
    }),
    renderWhen({
      signal,
      state: read_has_active_tab(app$),
      component: BuilderDeck,
      props: { app$ },
    }),
  ])
