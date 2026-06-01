import { h, type Component } from '@fun-land/fun-web'
import { funState } from '@fun-land/fun-state'
import type { ConceptInclusion } from '../models/TabConfig/TabConfig_types'
import * as css from './App.css'
import { add_selection, active_tab_config_acc, find_active_tab_config, initial_app_state } from '../models/AppState/AppState_operations'
import { is_concept_added } from '../models/AppState/AppState_reads'
import { create_toast, show_toast, ToastHost } from '../components/Toast'
import { Picker } from './Picker'
import { AppShell } from './AppShell'
import { load_state, save_state } from '../models/AppState/AppState_persistance'

export const App: Component<Record<never, never>> = ($, {}) => {
  const app$ = funState(load_state(initial_app_state))
  const active_config$ = funState(find_active_tab_config(app$.get()))
  const toast$ = create_toast()
  const picker_open$ = funState(false)

  // Save the app state to local storage whenever it changes
  app$.watch($, () => save_state(app$.get()))

  // Sync active config changes back into app$
  active_config$.watch($, (config) => 
    app$.focus(active_tab_config_acc).set(config)
  )

  // Load the incoming tab's config when the active tab changes
  app$.prop('active_tab_id').watch($, () => 
    active_config$.set(find_active_tab_config(app$.get()))
  )

  const on_choose = (concept_id: string, sign: ConceptInclusion): void => add_selection(active_config$, concept_id, sign)
  const is_added = (concept_id: string): boolean => is_concept_added(active_config$, concept_id).get()
  const on_regex_copied = (): void => show_toast(toast$, 'Regex copied')
  const open_picker = (): void => picker_open$.set(true)

  return h('div', { className: css.root }, [
    AppShell($, { app$, active_config$, open_picker, on_regex_copied }),
    Picker($, { picker_open$, on_choose, is_added }),
    ToastHost($, { toast$ }),
  ])
}
