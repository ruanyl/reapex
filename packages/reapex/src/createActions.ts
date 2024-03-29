import { App } from './app'
import { ActionCreatorMap, ActionCreatorMapForEffects, Mutator, TriggerMapInput } from './types'
import { typedKeyMirror } from './utils'

export const typedActionCreators = <N extends string, P extends Record<string, Mutator<any>>>(
  namespace: N,
  mutators: P,
  app: App
) => {
  const actionTypes = typedKeyMirror(mutators, namespace)
  const actionCreatorMap: ActionCreatorMap<P> = {} as ActionCreatorMap<P>

  Object.keys(mutators).forEach((k: keyof P) => {
    actionCreatorMap[k] = ((...payload: any[]) =>
      app.dispatch({
        type: actionTypes[k],
        payload,
      })) as any
  })
  return [actionCreatorMap, actionTypes] as const
}

export const typedActionCreatorsForTriggers = <N extends string, P extends TriggerMapInput>(
  namespace: N,
  triggerMap: P,
  app: App
) => {
  const prefix = `${namespace}/triggers` as const
  const actionTypes = typedKeyMirror(triggerMap, prefix)
  /* eslint-disable @typescript-eslint/indent */
  const actionCreatorMap: ActionCreatorMapForEffects<P> = {} as ActionCreatorMapForEffects<P>

  Object.keys(triggerMap).forEach((k: keyof P) => {
    actionCreatorMap[k] = ((...payload: any[]) =>
      app.dispatch({
        type: actionTypes[k],
        payload,
      })) as any
  })
  return [actionCreatorMap, actionTypes] as const
}
