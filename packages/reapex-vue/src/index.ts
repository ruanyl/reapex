import { App as ReapexApp } from 'reapex'
import { App as VueApp, inject, onUnmounted, ref, UnwrapRef } from 'vue'

export default {
  install: (vueApp: VueApp, reapexApp: ReapexApp) => {
    reapexApp.createStore()
    vueApp.provide('@@ReapexApp', reapexApp)
  },
}

export interface UseModel {
  <T, S extends (state: T) => any>(model: { getState: () => T }, selector: S): ReturnType<S>
  <T>(model: { getState: () => T }): T
}

export const useModel: UseModel = <T, S extends (s: T) => any>(model: { getState: () => T }, selector?: S) => {
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
      const newValue: ReturnType<S> = selector(newState)
      if (newValue !== state.value) {
        state.value = newValue
      }
    } else {
      state.value = newState as UnwrapRef<T>
    }
  }

  const unsubscribe = app.store.subscribe(storeSubscriber)

  onUnmounted(unsubscribe)

  return state
}
