import { h, type Component } from '@fun-land/fun-web'
import { type FunState } from '@fun-land/fun-state'
import type { Sign } from '../state/app_state'
import * as css from './App.css'
import { active_tab_config_acc } from './app_optics'
import { add_selection } from './app_ops'
import { Picker } from './Picker'
import { AppShell } from './AppShell'
import { type AppState } from '../state/app_state'

export type AppViewProps = { app$: FunState<AppState> }

export const App: Component<AppViewProps> = (signal, { app$ }) => {
  const on_choose = (concept_id: string, sign: Sign): void => add_selection(app$, concept_id, sign)
  const is_added = (concept_id: string): boolean => {
    const cfg = app$.focus(active_tab_config_acc).get()
    return cfg?.selections.some((sel) => sel.concept_id === concept_id) ?? false
  }

  return h('div', { className: css.root }, [
    AppShell(signal, { app$ }),
    Picker(signal, { app$, on_choose, is_added }),
  ])
}
