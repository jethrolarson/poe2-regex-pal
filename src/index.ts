import { App } from './views/App'

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

const signal = new AbortController().signal
root.appendChild(App(signal, {}))
