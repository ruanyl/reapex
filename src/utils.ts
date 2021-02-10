import { AnyAction } from 'redux'

export const actionTypeHasNamespace = (actionType: string) => actionType.includes('/')

export type ReducerMap<S extends any, A extends AnyAction> = {
  [P in A['type']]?: A extends { type: P } ? (state: S, action: A) => S : never
}

export const createReducer = <T extends any, S extends ReducerMap<T, AnyAction>>(initialState: T, reducerMap: S) => {
  return (state: T = initialState, action: AnyAction): T => {
    const actionType = action.type
    const reducer = reducerMap[actionType]
    if (reducer) {
      return reducer(state, action)
    } else {
      return state
    }
  }
}

export type Mirrored<T extends Record<string, unknown>> = {
  [K in keyof T]: K
}

export const typedKeyMirror = <T extends Record<string, unknown>>(
  keyMap: T,
  namespace: string,
  separator: string = '/'
) => {
  const keyMirrored: Mirrored<T> = {} as Mirrored<T>
  Object.keys(keyMap).forEach((k: keyof T) => (keyMirrored[k] = `${namespace}${separator}${k}`))
  return keyMirrored
}
