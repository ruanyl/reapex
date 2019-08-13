import {
  compose,
  converge,
  either,
  head,
  join,
  keys,
  map,
  mapObjIndexed,
  pickBy,
  tail,
  values,
  zipObj,
} from 'ramda'
import { Mirrored, typedKeyMirror } from 'reducer-tools'

import {
  ActionCreatorMap,
  ActionCreatorMapForEffects,
  Mutator,
  TriggerMapInput,
} from './types'

type Modifier = (key: string) => string

const hasPrefix = (prefix: string) => (_: any, key: string) =>
  key.indexOf(prefix) === 0
const isPureName = (_: any, key: string) => key.split('/').length === 1

const dropPrefix = (prefix: string) => (
  str: string,
  separator: string = '/'
) => {
  const arr = str.split(separator)
  if (head(arr) === prefix) {
    return join('/', tail(arr))
  }
  return str
}

const modifyObjKeys = (modifier: Modifier) =>
  converge(zipObj, [
    compose(
      map(modifier),
      keys
    ),
    values,
  ])

export const createAction = (name: string) => (_: any, key: string) => <
  T = any
>(
  payload?: T
) => ({ type: `${name}/${key}`, payload })

export const createActions = (name: string) =>
  compose(
    mapObjIndexed(createAction(name)),
    modifyObjKeys(dropPrefix(name)),
    pickBy(either(isPureName, hasPrefix(name)))
  )

export const typedActionCreators = <
  T extends Record<string, any>,
  P extends Record<string, Mutator<T>>
>(
  namespace: string,
  mutators: P
) => {
  const actionTypes = typedKeyMirror(mutators, namespace, '/')
  const actionCreatorMap: ActionCreatorMap<T, P> = {} as ActionCreatorMap<T, P>

  Object.keys(mutators).forEach(k => {
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
  triggerMap: P
) => {
  const actionTypes = typedKeyMirror(triggerMap, namespace, '/')
  const actionCreatorMap: ActionCreatorMapForEffects<
    P
  > = {} as ActionCreatorMapForEffects<P>

  Object.keys(triggerMap).forEach(k => {
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
