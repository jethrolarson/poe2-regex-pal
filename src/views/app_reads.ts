import { derive, type FunRead, type FunState } from '@fun-land/fun-state'
import type { AppState, Tab } from '../state/app_state'

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

/** Nullable active tab derived from disjoint props (avoids reacting to unrelated app edits) */
export const read_active_tab = (app$: FunState<AppState>): FunRead<Tab | undefined> =>
  derive(
    app$.prop('builds'),
    app$.prop('active_build_id'),
    app$.prop('active_tab_id'),
    (builds, bid, tid): Tab | undefined =>
      builds.find((b) => b.id === bid)?.tabs.find((t) => t.id === tid),
  )

export const read_has_active_build = (app$: FunState<AppState>): FunRead<boolean> =>
  derive(app$.prop('builds'), app$.prop('active_build_id'), (builds, id) =>
    builds.some((b) => b.id === id),
  )

export const read_has_active_tab = (app$: FunState<AppState>): FunRead<boolean> =>
  derive(
    app$.prop('builds'),
    app$.prop('active_build_id'),
    app$.prop('active_tab_id'),
    (builds, bid, tid): boolean =>
      builds.find((b) => b.id === bid)?.tabs.some((t) => t.id === tid) ?? false,
  )
