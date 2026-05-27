import type { Tab } from './AppState_types'
import type { Build } from './AppState_types'
import type { ConceptSelection } from '../TabConfig/TabConfig_types'

const include_concept = (concept_id: string): ConceptSelection => ({
  concept_id,
  sign: 'include',
  overrides: {},
})

const UNIVERSAL = [
  include_concept('group_MovementVelocity'),
  include_concept('group_IncreasedLife'),
  include_concept('res_all'),
]

const act_tab = (name: string, max_level: number): Tab => ({
    id: `t_generic_${name.toLowerCase().replace(/\s+/g, '')}`,
    name,
    config: { min_level: null, max_level, selections: UNIVERSAL },
})

export const GENERIC_BUILD = {
    id: 'b_generic',
    name: 'Leveling (generic)',
    tabs: [act_tab('Act 1', 12), act_tab('Act 2', 24), act_tab('Act 3', 36), act_tab('Act 4', 48)] as const,
} satisfies Build