import { ActionCreatorMap, ActionCreatorMapForEffects, Mutator, TriggerMapInput } from './types'
import { Mirrored, typedKeyMirror } from './utils'

export const typedActionCreators = <P extends Record<string, Mutator<any>>>(
  namespace: string,
  mutators: P,
  actionTypeDelimiter = '/'
) => {
  const actionTypes = typedKeyMirror(mutators, namespace, actionTypeDelimiter)
  const actionCreatorMap: ActionCreatorMap<P> = {} as ActionCreatorMap<P>

  Object.keys(mutators).forEach((k: keyof P) => {
    const mutator = mutators[k]
    actionCreatorMap[k] = ((...payload: Parameters<typeof mutator>) => ({
      type: actionTypes[k],
      payload,
    })) as any
  })
  return [actionCreatorMap, actionTypes] as [ActionCreatorMap<P>, Mirrored<P>]
}

export const typedActionCreatorsForEffects = <P extends TriggerMapInput>(
  namespace: string,
  triggerMap: P,
  actionTypeDelimiter = '/'
) => {
  const actionTypes = typedKeyMirror(triggerMap, namespace, actionTypeDelimiter)
  /* eslint-disable @typescript-eslint/indent */
  const actionCreatorMap: ActionCreatorMapForEffects<P> = {} as ActionCreatorMapForEffects<P>

  Object.keys(triggerMap).forEach((k: keyof P) => {
    actionCreatorMap[k] = ((...payload: any[]) => ({
      type: actionTypes[k],
      payload,
    })) as any
  })
  return [actionCreatorMap, actionTypes] as [ActionCreatorMapForEffects<P>, Mirrored<P>]
}
