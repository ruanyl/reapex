import { useCallback } from 'react'
import type { App, GlobalState } from 'reapex'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

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

  const finalSelector = useCallback(
    (state: GlobalState) => {
      const modelState = modelSelector(state)
      if (selector) {
        return selector(modelState) as ReturnType<S>
      }
      return modelState
    },
    [modelSelector, selector]
  )

  const store = model.__APP__.store ? model.__APP__.store : model.__APP__.createStore()
  const value = useSyncExternalStoreWithSelector<GlobalState, T | ReturnType<S>>(
    store.subscribe,
    store.getState,
    store.getState,
    finalSelector,
    refEquality
  )

  return value
}
