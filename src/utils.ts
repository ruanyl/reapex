import { AnyAction, Reducer } from 'redux'

export const actionTypeHasNamespace = (actionType: string) => actionType.includes('/')

export const createReducer = <S extends any, R extends Record<string, Reducer<S>>>(initialState: S, reducerMap: R) => {
  return (state: S = initialState, action: AnyAction): S => {
    const actionType = action.type
    const reducer = reducerMap[actionType]
    if (reducer) {
      return reducer(state, action)
    } else {
      return state
    }
  }
}

export type Mirrored<T extends Record<string, unknown>, N extends string> = {
  [K in keyof T]: `${N}/${string & K}`
}

export const typedKeyMirror = <T extends Record<string, unknown>, N extends string>(keyMap: T, namespace: N) => {
  const keyMirrored: Mirrored<T, N> = {} as Mirrored<T, N>
  Object.keys(keyMap).forEach((k: keyof T) => (keyMirrored[k] = `${namespace}/${k}` as const))
  return keyMirrored
}
