import { pickBy, either, mapObjIndexed, compose, head, tail, join, converge, map, keys, values, zipObj } from 'ramda'
import { typedKeyMirror } from 'reducer-tools';
import { Mutator } from './app';
// import { MutatorMap } from './app';

type Modifier = (key: string) => string

const hasPrefix = (prefix: string) => (_: any, key: string) => key.indexOf(prefix) === 0
const isPureName = (_: any, key: string) => key.split('/').length === 1

const dropPrefix = (prefix: string) => (str: string, separator: string = '/') => {
  const arr = str.split(separator)
  if (head(arr) === prefix) {
    return join('/', tail(arr))
  }
  return str
}

const modifyObjKeys = (modifier: Modifier) => converge(zipObj, [compose(map(modifier), keys), values])

export const createAction = (name: string) => (_: any, key: string) => <T = any>(payload?: T) => ({ type: `${name}/${key}`, payload })

export const createActions =
  (name: string) => compose(
    mapObjIndexed(createAction(name)),
    modifyObjKeys(dropPrefix(name)),
    pickBy(either(isPureName, hasPrefix(name)))
  )

interface Action<T, P> {
  type: T,
  payload: P
}

type ActionCreatorMap<T extends Record<string, any>, P extends Record<string, Mutator<T>>> = {
  [K in keyof P]: (...payload: Parameters<P[K]>) => Action<K, Parameters<P[K]>>
}

export const typedActionCreators = <T extends Record<string, any>, P extends Record<string, Mutator<T>>>(namespace: string, mutators: P) => {
  const actionTypes = typedKeyMirror(mutators, namespace, '/')
  const actionCreatorMap: ActionCreatorMap<T, P> = {} as ActionCreatorMap<T, P>

  Object.keys(mutators).forEach(k => {
    const mutator = mutators[k]
    actionCreatorMap[k] = ((...payload: Parameters<typeof mutator>) => ({
      type: actionTypes[k],
      payload
    })) as any
  })
  return actionCreatorMap
}
