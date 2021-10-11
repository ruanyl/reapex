import { useCallback, useMemo } from 'react'
import { App, GlobalState } from 'reapex'
import { useSyncExternalStoreExtra } from 'use-sync-external-store/extra'

const refEquality = (a: any, b: any) => a === b

interface ModelLike<T> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __APP__: App
  namespace: string
  getState: () => T
}

export interface UseModel {
  <T, S extends (state: T) => any>(model: ModelLike<T>, selector: S): ReturnType<S>
  <T>(model: ModelLike<T>): T
}

export const useModel: UseModel = <T, S extends (state: T) => any>(model: ModelLike<T>, selector?: S) => {
  const modelSelector = useCallback(
    (state: GlobalState) => {
      return state[model.namespace] as T
    },
    [model.namespace]
  )

  const store = model.__APP__.store ? model.__APP__.store : model.__APP__.createStore()
  const value = useSyncExternalStoreExtra<GlobalState, T>(
    store.subscribe,
    store.getState,
    store.getState,
    modelSelector,
    refEquality
  )

  const result = useMemo(() => {
    if (selector) {
      return selector(value)
    }
    return value
  }, [selector, value])

  return result
}
