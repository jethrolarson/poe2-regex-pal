import { Acc, removeAt } from '@fun-land/accessor'
import type { FunState } from '@fun-land/fun-state'
import type { TabConfig } from './TabConfig_types'

export const remove_selection = (config$: FunState<TabConfig>, index: number): void =>
  config$.prop('selections').mod(removeAt(index))

const selections_by_index_acc = (index: number) => Acc<TabConfig>().prop('selections').at(index)
const overrides_by_index_acc = (index: number) => selections_by_index_acc(index).prop('overrides')
const overrides_by_affix_id_acc = (index: number, affix_id: string) => Acc<TabConfig>().prop('selections').at(index).prop('overrides').prop(affix_id)

export const set_override = (
  config$: FunState<TabConfig>,
  index: number,
  affix_id: string,
  checked: boolean,
): void =>
  config$.focus(overrides_by_affix_id_acc(index, affix_id)).set(checked)

export const set_all_overrides = (
  config$: FunState<TabConfig>,
  index: number,
  affix_ids: readonly string[],
  checked: boolean,
): void => {
  const overrides = Object.fromEntries(affix_ids.map((id) => [id, checked]))
  config$.focus(overrides_by_index_acc(index)).set(overrides)
}
