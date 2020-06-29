import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'
import { Map, Record as ImmutableRecord } from 'immutable'
import { AnyAction, combineReducers, Middleware, Reducer, ReducersMapObject, Store } from 'redux'
import { all } from 'redux-saga/effects'

import { typedActionCreators, typedActionCreatorsForEffects } from './createActions'
import { createState, Selectors, State, StateShape } from './createState'
import { createSaga, safeFork } from './sagaHelpers'
import { configureStore } from './store'
import {
  AnyActionCreator,
  EffectMap,
  EffectMapInput,
  MutatorInput,
  Plugin,
  StateMap,
  SubscriberInput,
  TriggerMapInput,
  Watcher,
} from './types'
import { actionTypeHasNamespace as defaultActionTypeHasNamespace, createReducer } from './utils'

export interface AppConfig {
  middlewares: Middleware[]
  actionTypeHasNamespace: (actionType: string) => boolean
  immutableRootState: boolean
}
export type Logic = (app: App, ...args: any[]) => any

export const mutationsLoaded = (namespace: string) => ({
  type: '@@GLOBAL/MUTATIONS_LOADED',
  payload: [namespace],
})

export const effectsLoaded = (namespace: string) => ({
  type: '@@GLOBAL/EFFECTS_LOADED',
  payload: [namespace],
})

export class App {
  rootReducers: ReducersMapObject = {}
  sagas: Watcher[] = []
  states: StateMap<StateShape> = {}
  effectsArray: EffectMap[] = []
  actionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  effectActionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  selectors: Record<string, Selectors<StateShape, State<StateShape>>> = {}
  store: Store<Map<string, any> | Record<string, any>>
  sagaMiddleware: SagaMiddleware<any>
  plugins: Plugin[] = []

  appConfig: AppConfig = {
    middlewares: [],
    actionTypeHasNamespace: defaultActionTypeHasNamespace,
    immutableRootState: false,
  }

  constructor(props: Partial<AppConfig> = {}) {
    const { actionTypeHasNamespace, ...appConfig } = props

    // 1. update this.appConfig
    this.appConfig = { ...this.appConfig, ...appConfig }

    // 2. if actionTypeHasNamespace exists, combine it with the default one
    if (actionTypeHasNamespace) {
      this.appConfig = {
        ...this.appConfig,
        actionTypeHasNamespace: (actionType: string) =>
          actionTypeHasNamespace(actionType) || defaultActionTypeHasNamespace(actionType),
      }
    }
  }

  model<T extends StateShape, S extends T | ImmutableRecord<T>>(namespace: string, initialState: S) {
    const stateClass = createState(namespace, initialState)
    this.states[namespace] = stateClass
    this.selectors[namespace] = stateClass.selectors

    const mutationFunc = <M extends MutatorInput<S>, N extends SubscriberInput<S>>(
      mutationMap: M,
      subscriptions?: N
    ) => {
      // create action creators
      const [actionCreators, actionTypes] = typedActionCreators(namespace, mutationMap)
      this.actionCreators[namespace] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Record<string, Reducer> = {}
      Object.keys(mutationMap).forEach(key => {
        namedMutations[`${namespace}/${key}`] = (s: S, a: AnyAction) => {
          let mutator = mutationMap[key]
          this.plugins.forEach(plugin => {
            if (plugin.beforeMutation) {
              mutator = plugin.beforeMutation(mutationMap[key])
            }
          })
          return mutator(...a.payload)(s)
        }
      })

      if (subscriptions) {
        Object.keys(subscriptions).forEach(key => {
          namedMutations[key] = (s: S, a: AnyAction) => subscriptions[key](a)(s)
        })
      }

      this.rootReducers[namespace] = createReducer(initialState, namedMutations)
      if (this.store) {
        this.store.replaceReducer(this.getReducer())
        this.store.dispatch(mutationsLoaded(namespace))
      }
      return [actionCreators, actionTypes] as const
    }

    const effectFunc = <M extends EffectMapInput, N extends TriggerMapInput>(effectMap: M, triggerMap: N = {} as N) => {
      const namedEffects: EffectMap = {}
      Object.keys(effectMap).forEach(key => {
        const sagaConfig = effectMap[key]
        const hasNamespace = this.appConfig.actionTypeHasNamespace(key)
        const namespaceKey = hasNamespace ? key : `${namespace}/${key}`

        if (typeof sagaConfig === 'function') {
          namedEffects[`${namespaceKey}`] = sagaConfig
        } else {
          namedEffects[`${namespaceKey}`] = { ...sagaConfig, trigger: false }
        }
      })

      const [effectAcrionCreators, actionTypes] = typedActionCreatorsForEffects(`${namespace}`, triggerMap)
      this.effectActionCreators[namespace] = effectAcrionCreators

      Object.keys(triggerMap).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(effectMap, key)) {
          throw new Error(
            `${namespace}.effects(), key: ${key} in ${JSON.stringify(triggerMap)} also appears in ${JSON.stringify(
              effectMap
            )}`
          )
        }
        const triggerConfig = triggerMap[key]
        namedEffects[`${namespace}/${key}`] = {
          ...triggerConfig,
          trigger: true,
        }
      })

      // dynamically register saga
      if (this.store) {
        this.sagaMiddleware.run(function*() {
          const saga = createSaga(namedEffects)
          yield safeFork(saga)
        })
        this.store.dispatch(effectsLoaded(namespace))
      } else {
        this.effectsArray.push(namedEffects)
      }
      return [effectAcrionCreators, actionTypes] as const
    }

    return {
      state: stateClass,
      selectors: stateClass.selectors,
      mutations: mutationFunc,
      effects: effectFunc,
    }
  }

  runSaga(sagas: Watcher | Watcher[]) {
    const allSagas = Array<Watcher>().concat(sagas)
    if (this.store) {
      allSagas.forEach(saga => {
        this.sagaMiddleware.run(function*() {
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
    const sagas = this.effectsArray
      .map(createSaga)
      .concat(this.sagas)
      .map(safeFork)
    return function*() {
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
      if (this.appConfig.immutableRootState) {
        const { combineReducers: immutableCombineReducers } = require('redux-immutable')
        const rootReducer = immutableCombineReducers(this.rootReducers)
        return rootReducer
      } else {
        const rootReducer = combineReducers(this.rootReducers)
        return rootReducer
      }
    } else {
      return (() => (this.appConfig.immutableRootState ? Map() : {})) as Reducer<any, AnyAction>
    }
  }

  createStore() {
    const rootSagas = this.createRootSagas()
    const reducer = this.getReducer()
    this.sagaMiddleware = createSagaMiddleware()
    const store = configureStore(reducer, [...this.appConfig.middlewares, this.sagaMiddleware])
    this.sagaMiddleware.run(rootSagas)
    this.store = store
    return store
  }
}
