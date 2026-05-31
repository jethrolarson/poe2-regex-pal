import { funState } from '@fun-land/fun-state'
import { App } from './views/App'
import { initial_app_state, active_tab_config_acc, find_active_tab_config } from './models/AppState/AppState_operations'
import { load_state, save_state } from './models/AppState/AppState_persistance'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

const app$ = funState(load_state(initial_app_state))
const active_config$ = funState(find_active_tab_config(app$.get()))
const signal = new AbortController().signal

// Sync active config changes back into the persisted build tree
active_config$.watch(signal, (config) => {
  app$.focus(active_tab_config_acc).set(config)
})

// Load the incoming tab's config when the active tab changes
app$.prop('active_tab_id').watch(signal, () => {
  active_config$.set(find_active_tab_config(app$.get()))
})

app$.watch(signal, () => {
  save_state(app$.get())
})

root.appendChild(App(signal, { app$, active_config$ }))
