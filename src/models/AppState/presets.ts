import type { Build, Tab } from './AppState_types'
import { make_selection } from '../TabConfig/TabConfig_operations'

const UNIVERSAL_CONCEPT_IDS = ['group_MovementVelocity', 'group_IncreasedLife', 'res_all']

const act_tab = (name: string, max_level: number): Tab => ({
  id: `t_generic_${name.toLowerCase().replace(/\s+/g, '')}`,
  name,
  config: {
    selections: UNIVERSAL_CONCEPT_IDS.map((id) => make_selection(id, 'include', null, max_level)),
  },
})

export const GENERIC_BUILD: Build = {
  id: 'b_generic',
  name: 'Leveling (generic)',
  tabs: [act_tab('Act 1', 12), act_tab('Act 2', 24), act_tab('Act 3', 36), act_tab('Act 4', 48)],
}
