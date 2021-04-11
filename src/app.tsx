import React from 'react'
import createSagaMiddleware, { Saga, SagaMiddleware } from 'redux-saga'
import { render } from 'react-dom'
import { Provider, useSelector } from 'react-redux'
import { AnyAction, combineReducers, Middleware, Reducer, ReducersMapObject, Store } from 'redux'
import { all } from 'redux-saga/effects'

import { typedActionCreators, typedActionCreatorsForTriggers } from './createActions'
import { createState, GlobalState, Selectors, StateShape } from './createState'
import { createSaga, safeFork } from './sagaHelpers'
import { configureStore } from './store'
import { AnyActionCreator, EffectMap, EffectMapInput, MutatorInput, Plugin, StateMap, TriggerMapInput } from './types'
import { createReducer } from './utils'

export interface AppConfig {
  middlewares: Middleware[]
}
export type Logic = (app: App, ...args: any[]) => any

export const mutationsLoaded = (namespace: string) => ({
  type: '@@GLOBAL/MUTATIONS_LOADED',
  payload: [namespace],
})

export const subscriptionsLoaded = (namespace: string) => ({
  type: '@@GLOBAL/SUBSCRIPTIONS_LOADED',
  payload: [namespace],
})

export const effectsLoaded = (namespace: string) => ({
  type: '@@GLOBAL/EFFECTS_LOADED',
  payload: [namespace],
})

export const triggersLoaded = (namespace: string) => ({
  type: '@@GLOBAL/TRIGGERS_LOADED',
  payload: [namespace],
})

export class App {
  rootReducers: ReducersMapObject = {}
  sagas: Saga[] = []
  states: StateMap<StateShape> = {}
  effectsArray: EffectMap[] = []
  actionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  effectActionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  selectors: Record<string, Selectors<StateShape>> = {}
  store: Store<Record<string, any>>
  sagaMiddleware: SagaMiddleware<any>
  plugins: Plugin[] = []

  appConfig: AppConfig = {
    middlewares: [],
  }

  constructor(appConfig: Partial<AppConfig> = {}) {
    this.appConfig = { ...this.appConfig, ...appConfig }
  }

  model<T extends StateShape, N extends string>(namespace: N, initialState: T) {
    const stateClass = createState(namespace, initialState)
    this.states[namespace] = stateClass
    this.selectors[namespace] = stateClass.selectors
    // reducer map which key is prepend with namespace
    const namedMutations: Record<string, Reducer<T>> = {}

    const mutationFunc = <M extends MutatorInput<T>>(mutationMap: M) => {
      // create action creators
      const [actionCreators, actionTypes] = typedActionCreators(namespace, mutationMap, this)
      this.actionCreators[namespace] = actionCreators

      Object.keys(mutationMap).forEach((key) => {
        namedMutations[`${namespace}/${key}`] = (s: T, a: AnyAction) => {
          let mutator = mutationMap[key]
          this.plugins.forEach((plugin) => {
            if (plugin.beforeMutation) {
              mutator = plugin.beforeMutation(mutationMap[key])
            }
          })
          return mutator(...a.payload)(s)
        }
      })

      this.rootReducers[namespace] = createReducer(initialState, namedMutations)
      if (this.store) {
        this.store.replaceReducer(this.getReducer())
        this.store.dispatch(mutationsLoaded(namespace))
      }
      return [actionCreators, actionTypes] as const
    }

    const runEffects = (effectMap: EffectMapInput, nsp?: string) => {
      const namedEffects: EffectMap = {}
      Object.keys(effectMap).forEach((key) => {
        const sagaConfig = effectMap[key]
        const namespaceKey = nsp ? `${nsp}/${key}` : key

        if (typeof sagaConfig === 'function') {
          namedEffects[`${namespaceKey}`] = { takeEvery: sagaConfig, trigger: false }
        } else {
          namedEffects[`${namespaceKey}`] = { ...sagaConfig, trigger: false }
        }
      })

      // dynamically register saga
      if (this.store) {
        this.sagaMiddleware.run(function* () {
          const saga = createSaga(namedEffects)
          yield safeFork(saga)
        })

        if (nsp) {
          this.store.dispatch(effectsLoaded(nsp))
        }
      } else {
        this.effectsArray.push(namedEffects)
      }
    }

    const effectFunc = <M extends EffectMapInput>(effectMap: M) => {
      runEffects(effectMap, namespace)
    }

    const subscriptionFunc = <M extends EffectMapInput>(effectMap: M) => {
      runEffects(effectMap)
    }

    const triggerFunc = <N extends TriggerMapInput>(triggerMap: N) => {
      const namedEffects: EffectMap = {}
      const [effectAcrionCreators, actionTypes] = typedActionCreatorsForTriggers(namespace, triggerMap, this)
      this.effectActionCreators[namespace] = effectAcrionCreators

      Object.keys(triggerMap).forEach((key) => {
        const triggerConfig = triggerMap[key]

        if (typeof triggerConfig === 'function') {
          namedEffects[`${namespace}/triggers/${key}`] = { takeEvery: triggerConfig, trigger: true }
        } else {
          namedEffects[`${namespace}/triggers/${key}`] = { ...triggerConfig, trigger: true }
        }
      })

      // dynamically register saga
      if (this.store) {
        this.sagaMiddleware.run(function* () {
          const saga = createSaga(namedEffects)
          yield safeFork(saga)
        })
        this.store.dispatch(triggersLoaded(namespace))
      } else {
        this.effectsArray.push(namedEffects)
      }
      return [effectAcrionCreators, actionTypes] as const
    }

    const useState = <S extends (state: T) => any>(selector: S): ReturnType<S> => {
      const value = useSelector((s: GlobalState) => selector(stateClass.selectors.self(s)))
      return value
    }

    const getState = () => {
      if (!this.store) {
        throw new Error(`Store has not initiated: ${namespace}`)
      }
      return stateClass.selectors.self(this.store.getState())
    }

    return {
      state: stateClass,
      selectors: stateClass.selectors,
      mutations: mutationFunc,
      subscriptions: subscriptionFunc,
      effects: effectFunc,
      triggers: triggerFunc,
      useState,
      getState,
    }
  }

  runSaga(sagas: Saga | Saga[]) {
    const allSagas = Array<Saga>().concat(sagas)
    if (this.store) {
      allSagas.forEach((saga) => {
        this.sagaMiddleware.run(function* () {
          yield safeFork(saga)
        })
      })
    } else {
      this.sagas.push(...allSagas)
    }
  }

  plugin(plug: Plugin) {
    this.plugins.push(plug)
  }

  use<T extends Logic>(logic: T, ...args: any[]): ReturnType<typeof logic> {
    return logic(this, ...args)
  }

  hasModel(name: string) {
    return Object.prototype.hasOwnProperty.call(this.states, name)
  }

  createRootSagas() {
    const sagas = this.effectsArray.map(createSaga).concat(this.sagas).map(safeFork)
    return function* () {
      yield all(sagas)
    }
  }

  registerReducer(name: string, reducer: Reducer) {
    this.rootReducers[name] = reducer
    if (this.store) {
      this.store.replaceReducer(this.getReducer())
    }
  }

  setExternalReducers(reducers: Record<string, Reducer>) {
    this.rootReducers = {
      ...this.rootReducers,
      ...reducers,
    }
    if (this.store) {
      this.store.replaceReducer(this.getReducer())
    }
  }

  getReducer() {
    if (Object.entries(this.rootReducers).length !== 0) {
      const rootReducer = combineReducers(this.rootReducers)
      return rootReducer
    } else {
      return () => ({})
    }
  }

  dispatch(action: AnyAction) {
    if (this.store) {
      this.store.dispatch(action)
    } else {
      throw new Error('Store has not initiated')
    }
  }

  createStore(initialState?: Record<string, any>) {
    const rootSagas = this.createRootSagas()
    const reducer = this.getReducer()
    this.sagaMiddleware = createSagaMiddleware()
    const store = configureStore(reducer, [...this.appConfig.middlewares, this.sagaMiddleware], initialState)
    this.sagaMiddleware.run(rootSagas)
    this.store = store
    return store
  }

  render(Comp: React.ComponentType, target?: HTMLElement | null) {
    const store = this.store ?? this.createStore()
    if (target) {
      render(
        <Provider store={store}>
          <Comp />
        </Provider>,
        target
      )
    } else {
      return () => (
        <Provider store={store}>
          <Comp />
        </Provider>
      )
    }
  }
}
