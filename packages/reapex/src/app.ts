import createSagaMiddleware, { Saga, SagaMiddleware } from 'redux-saga'
import { AnyAction, combineReducers, Middleware, Reducer, ReducersMapObject, Store } from 'redux'
import { all } from 'redux-saga/effects'
import { SyncWaterfallHook } from 'tapable'

import { typedActionCreators, typedActionCreatorsForTriggers } from './createActions'
import { createState, Selectors, StateShape } from './createState'
import { mutationsLoaded, sagaLoaded, unloadSaga } from './globalActions'
import { createSaga, safeFork } from './sagaHelpers'
import { configureStore } from './store'
import {
  AnyActionCreator,
  EffectMap,
  EffectMapInput,
  Hooks,
  Mutator,
  MutatorInput,
  Plugin,
  SagaKind,
  StateMap,
  TriggerMapInput,
} from './types'
import { createReducer } from './utils'

export interface AppConfig {
  middlewares: Middleware[]
}
export type Logic = (app: App, ...args: any[]) => any

export class App {
  rootReducers: ReducersMapObject = {}
  sagas: Saga[] = []
  sagaMap: Record<string, Saga> = {}
  states: StateMap<StateShape> = {}
  actionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  effectActionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  selectors: Record<string, Selectors<StateShape>> = {}
  store: Store<Record<string, any>>
  sagaMiddleware: SagaMiddleware<any>
  hooks: Hooks = {
    beforeMutation: new SyncWaterfallHook<Mutator<any>, Mutator<any>>(['mutator']),
  }

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
          mutator = this.hooks.beforeMutation.call(mutator)
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

    const runEffects = (effectMap: EffectMapInput, kind: SagaKind) => {
      const namedEffects: EffectMap = {}
      Object.keys(effectMap).forEach((key) => {
        const sagaConfig = effectMap[key]
        const namespaceKey = kind === 'EFFECT' ? `${namespace}/${key}` : key

        if (typeof sagaConfig === 'function') {
          namedEffects[`${namespaceKey}`] = { takeEvery: sagaConfig, trigger: false }
        } else {
          namedEffects[`${namespaceKey}`] = { ...sagaConfig, trigger: false }
        }
      })

      // dynamically register saga
      const saga = createSaga(namedEffects, namespace, kind)
      if (this.store) {
        // unload the existing saga so that the same saga won't run multiple times
        this.store.dispatch(unloadSaga(namespace, kind))

        this.sagaMiddleware.run(function* () {
          yield safeFork(saga)
        })

        this.store.dispatch(sagaLoaded(namespace, kind))
      } else {
        this.sagaMap[`${namespace}/${kind}`] = saga
      }
    }

    const effectFunc = <M extends EffectMapInput>(effectMap: M) => {
      runEffects(effectMap, 'EFFECT')
    }

    const subscriptionFunc = <M extends EffectMapInput>(effectMap: M) => {
      runEffects(effectMap, 'SUBSCRIPTION')
    }

    const triggerFunc = <TM extends TriggerMapInput>(triggerMap: TM) => {
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
      const saga = createSaga(namedEffects, namespace, 'TRIGGER')
      if (this.store) {
        this.store.dispatch(unloadSaga(namespace, 'TRIGGER'))

        this.sagaMiddleware.run(function* () {
          yield safeFork(saga)
        })

        this.store.dispatch(sagaLoaded(namespace, 'TRIGGER'))
      } else {
        this.sagaMap[`${namespace}/TRIGGER`] = saga
      }
      return [effectAcrionCreators, actionTypes] as const
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
    plug(this.hooks)
  }

  use<T extends Logic>(logic: T, ...args: any[]): ReturnType<typeof logic> {
    return logic(this, ...args)
  }

  hasModel(name: string) {
    return Object.prototype.hasOwnProperty.call(this.states, name)
  }

  createRootSagas() {
    const sagas = Object.values(this.sagaMap).concat(this.sagas).map(safeFork)
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
}
