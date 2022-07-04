import createSagaMiddleware, { Saga, SagaMiddleware } from 'redux-saga'
import { AnyAction, combineReducers, Middleware, Reducer, ReducersMapObject, Store } from 'redux'
import { all } from 'redux-saga/effects'
import { AsyncSeriesHook, SyncWaterfallHook } from 'tapable'

import { typedActionCreators, typedActionCreatorsForTriggers } from './createActions'
import { mutationsLoaded, sagaLoaded, unloadSaga } from './globalActions'
import { createSaga, safeFork } from './sagaHelpers'
import { configureStore } from './store'
import {
  AnyActionCreator,
  EffectMap,
  EffectMapInput,
  Hooks,
  Model,
  Mutator,
  MutatorInput,
  Plugin,
  SagaKind,
  TriggerMapInput,
} from './types'
import { createReducer } from './utils'

export interface AppConfig {
  name: string
  middleware: Middleware[]
}
export type Logic = (app: App, ...args: any[]) => any

export class App {
  rootReducers: ReducersMapObject = {}
  sagas: Saga[] = []
  sagaMap: Record<string, Saga> = {}
  actionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  effectActionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  store: Store<Record<string, any>>
  sagaMiddleware: SagaMiddleware<any>
  hooks: Hooks = {
    beforeMutation: new SyncWaterfallHook<[Mutator<any>, any, string]>(['mutator', 'state', 'namespace']),
    afterMutationAsync: new AsyncSeriesHook<[any, string]>(['state', 'namespace']),
    beforeModelInitialized: new SyncWaterfallHook<[unknown, string]>(['initialState', 'namespace']),
  }

  appConfig: AppConfig = {
    middleware: [],
    name: 'default',
  }

  constructor(appConfig: Partial<AppConfig> = {}) {
    this.appConfig = { ...this.appConfig, ...appConfig }
  }

  model<T, N extends string>(namespace: N, initialState: T): Model<T, N> {
    // reducer map which key is prepend with namespace
    const namedMutations: Record<string, Reducer<T>> = {}

    const mutationFunc = <M extends MutatorInput<T>>(mutationMap: M) => {
      // create action creators
      const [actionCreators, actionTypes] = typedActionCreators(namespace, mutationMap, this)
      this.actionCreators[namespace] = actionCreators

      Object.keys(mutationMap).forEach((key) => {
        namedMutations[`${namespace}/${key}`] = (s: T, a: AnyAction) => {
          let mutator = mutationMap[key]
          mutator = this.hooks.beforeMutation.call(mutator, s, namespace)
          s = mutator(...a.payload)(s)

          this.hooks.afterMutationAsync.callAsync(s, namespace, (e) => {
            if (e) {
              throw e
            }
          })

          return s
        }
      })

      initialState = this.hooks.beforeModelInitialized.call(initialState, namespace) as T
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
      const [effectActionCreators, actionTypes] = typedActionCreatorsForTriggers(namespace, triggerMap, this)
      this.effectActionCreators[namespace] = effectActionCreators

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
      return [effectActionCreators, actionTypes] as const
    }

    const getState = () => {
      if (!this.store) {
        this.store = this.createStore()
      }
      const state = this.store.getState()
      return state[namespace] as T
    }

    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __APP__: this as App,
      namespace,
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
    plug(this.hooks, this)
  }

  use<T extends Logic>(logic: T, ...args: any[]): ReturnType<typeof logic> {
    return logic(this, ...args)
  }

  hasModel(name: string) {
    return Object.prototype.hasOwnProperty.call(this.rootReducers, name)
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
    if (!this.store) {
      this.store = this.createStore()
    }

    return this.store.dispatch(action)
  }

  createStore(initialState?: Record<string, any>) {
    const rootSagas = this.createRootSagas()
    const reducer = this.getReducer()
    this.sagaMiddleware = createSagaMiddleware()
    const store = configureStore(reducer, [...this.appConfig.middleware, this.sagaMiddleware], initialState)
    this.sagaMiddleware.run(rootSagas)
    this.store = store
    return store
  }
}
