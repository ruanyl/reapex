import type { App } from 'reapex'
import { onUnmounted, ref, UnwrapRef } from 'vue'

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

export const useModel: UseModel = <T, S extends (s: T) => any>(model: ModelLike<T>, selector?: S) => {
  const store = model.__APP__.store ? model.__APP__.store : model.__APP__.createStore()

  const state = selector ? ref<T | ReturnType<S>>(selector(model.getState())) : ref(model.getState())

  const storeSubscriber = () => {
    const newState = model.getState()

    if (newState === state.value) {
      return
    }

    if (selector) {
      const newValue: ReturnType<S> = selector(newState)
      if (newValue !== state.value) {
        state.value = newValue
      }
    } else {
      state.value = newState as UnwrapRef<T>
    }
  }

  const unsubscribe = store.subscribe(storeSubscriber)

  onUnmounted(unsubscribe)

  return state
}
