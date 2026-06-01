import { h, type Component } from '@fun-land/fun-web'
import { funState, type FunState } from '@fun-land/fun-state'
import type { ConceptInclusion } from '../models/TabConfig/TabConfig_types'
import * as css from './App.css'
import { add_selection, active_tab_config_acc, find_active_tab_config } from '../models/AppState/AppState_operations'
import { is_concept_added } from '../models/AppState/AppState_reads'
import { create_toast, show_toast, ToastHost } from '../components/Toast'
import { Picker } from './Picker'
import { AppShell } from './AppShell'
import { type AppState } from '../models/AppState/AppState_types'

export type AppViewProps = { app$: FunState<AppState> }

export const App: Component<AppViewProps> = (signal, { app$ }) => {
  const active_config$ = funState(find_active_tab_config(app$.get()))
  const toast$ = create_toast()
  const picker_open$ = funState(false)

  active_config$.watch(signal, (config) => {
    app$.focus(active_tab_config_acc).set(config)
  })

  app$.prop('active_tab_id').watch(signal, () => {
    active_config$.set(find_active_tab_config(app$.get()))
  })

  const on_choose = (concept_id: string, sign: ConceptInclusion): void => add_selection(active_config$, concept_id, sign)
  const is_added = (concept_id: string): boolean => is_concept_added(active_config$, concept_id).get()
  const on_regex_copied = (): void => show_toast(toast$, 'Regex copied')
  const open_picker = (): void => picker_open$.set(true)

  return h('div', { className: css.root }, [
    AppShell(signal, { app$, active_config$, open_picker, on_regex_copied }),
    Picker(signal, { picker_open$, on_choose, is_added }),
    ToastHost(signal, { toast$ }),
  ])
}
