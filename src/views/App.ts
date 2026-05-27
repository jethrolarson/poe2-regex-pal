import { h, type Component } from '@fun-land/fun-web'
import { type FunState } from '@fun-land/fun-state'
import type { ConceptInclusion } from '../models/TabConfig/TabConfig_types'
import * as css from './App.css'
import { add_selection } from '../models/AppState/AppState_operations'
import { is_concept_added } from '../models/AppState/AppState_reads'
import { Picker } from './Picker'
  import { AppShell } from './AppShell'
  import { type AppState } from '../models/AppState/AppState_types'

export type AppViewProps = { app$: FunState<AppState> }

export const App: Component<AppViewProps> = (signal, { app$ }) => {
  const on_choose = (concept_id: string, sign: ConceptInclusion): void => add_selection(app$, concept_id, sign)
  const is_added = (concept_id: string): boolean => is_concept_added(app$, concept_id).get()

  return h('div', { className: css.root }, [
    AppShell(signal, { app$ }),
    Picker(signal, { app$, on_choose, is_added }),
  ])
}
