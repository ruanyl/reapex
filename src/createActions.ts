import { Mirrored, typedKeyMirror } from 'reducer-tools'

import {
  ActionCreatorMap,
  ActionCreatorMapForEffects,
  Mutator,
  TriggerMapInput,
} from './types'

export const typedActionCreators = <
  T extends Record<string, any>,
  P extends Record<string, Mutator<T>>
>(
  namespace: string,
  mutators: P,
  actionTypeDelimiter = '/'
) => {
  const actionTypes = typedKeyMirror(mutators, namespace, actionTypeDelimiter)
  const actionCreatorMap: ActionCreatorMap<T, P> = {} as ActionCreatorMap<T, P>

  Object.keys(mutators).forEach((k: keyof P) => {
    const mutator = mutators[k]
    actionCreatorMap[k] = ((...payload: Parameters<typeof mutator>) => ({
      type: actionTypes[k],
      payload,
    })) as any
  })
  return [actionCreatorMap, actionTypes] as [
    ActionCreatorMap<T, P>,
    Mirrored<P>
  ]
}

export const typedActionCreatorsForEffects = <P extends TriggerMapInput>(
  namespace: string,
  triggerMap: P,
  actionTypeDelimiter = '/'
) => {
  const actionTypes = typedKeyMirror(triggerMap, namespace, actionTypeDelimiter)
  const actionCreatorMap: ActionCreatorMapForEffects<
    P
  > = {} as ActionCreatorMapForEffects<P>

  Object.keys(triggerMap).forEach((k: keyof P) => {
    actionCreatorMap[k] = ((...payload: any[]) => ({
      type: actionTypes[k],
      payload,
    })) as any
  })
  return [actionCreatorMap, actionTypes] as [
    ActionCreatorMapForEffects<P>,
    Mirrored<P>
  ]
}
