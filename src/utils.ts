import { AnyAction } from 'redux'

export const actionTypeHasNamespace = (actionType: string) => actionType.includes('/')

export type ReducerMap<S extends any, A extends AnyAction> = {
  [P in A['type']]?: A extends { type: P } ? (state: S, action: A) => S : never
}

export const createReducer = <T extends any, S extends ReducerMap<T, AnyAction>>(initialState: T, reducerMap: S) => {
  return (state: T = initialState, action: AnyAction): T => {
    const actionType = action.type
    if (reducerMap.hasOwnProperty(actionType)) {
      return reducerMap[action.type]!(state, action)
    } else {
      return state
    }
  }
}

export type Mirrored<T extends object> = {
  [K in keyof T]: K
}

export const typedKeyMirror = <T extends object>(keyMap: T, namespace: string, separator: string = '_') => {
  const keyMirrored: Mirrored<T> = {} as Mirrored<T>
  // @ts-ignore
  Object.keys(keyMap).forEach(k => (keyMirrored[k] = `${namespace}${separator}${k}`))
  return keyMirrored
}
