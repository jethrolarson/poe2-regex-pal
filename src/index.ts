import { funState } from '@fun-land/fun-state'
import { App } from './views/App'
import { initial_app_state } from './models/AppState/AppState_operations'
import { load_state, save_state } from './models/AppState/AppState_persistance'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

const app$ = funState(load_state(initial_app_state))
const signal = new AbortController().signal

root.appendChild(App(signal, { app$ }))
app$.watch(signal, () => {
  save_state(app$.get())
})
