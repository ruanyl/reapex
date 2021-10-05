import { App as ReapexApp, StateObject, StateShape } from 'reapex'
import { App as VueApp, inject, onUnmounted, ref } from 'vue'

export default {
  install: (vueApp: VueApp, reapexApp: ReapexApp) => {
    reapexApp.createStore()
    vueApp.provide('@@ReapexApp', reapexApp)
  },
}

export interface UseModel {
  <T extends StateShape, S extends (state: T) => any>(model: { state: StateObject<T> }, selector: S): ReturnType<S>
  <T extends StateShape>(model: { state: StateObject<T> }): T
}

export const useModel: UseModel = <T extends StateShape, S extends (s: T) => any>(
  model: { state: StateObject<T>; getState: () => T },
  selector?: S
) => {
  const app: ReapexApp | undefined = inject('@@ReapexApp')

  if (!app) {
    throw 'Reapex not been provided'
  }

  const state = selector ? ref<T | ReturnType<S>>(selector(model.getState())) : ref(model.getState())

  const storeSubscriber = () => {
    const newState = model.getState()

    if (newState === state.value) {
      return
    }

    if (selector) {
      const newValue = selector(newState)
      if (newValue !== state.value) {
        state.value = newState
      }
    }

    state.value = newState
  }

  const unsubscribe = app.store.subscribe(storeSubscriber)

  onUnmounted(unsubscribe)

  return state
}
