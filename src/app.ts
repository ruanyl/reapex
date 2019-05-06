import React, { ComponentType } from 'react'
import Redux, { Middleware, Reducer } from 'redux'
import { contains } from 'ramda'
import { takeEvery, call, all, spawn, takeLatest, throttle } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, StateObject, LocalState } from 'immutable-state-creator'
import { createReducer, AnyAction } from 'reducer-tools'
import { Map } from 'immutable'

import { typedActionCreators, Action } from './createActions'
import { configureStore } from './store'
import { Registry, registryReducer, register, registerAll } from './registry'
import sagaMiddleware from './createSagaMiddleware';

export type Mutator<T> = (...payload: any[]) => (localstate: LocalState<T>) => LocalState<T>
export type StateMap<T extends Record<string, any>> = Record<string, StateObject<T>>
export type ActionCreators = Record<string, ReturnType<typeof typedActionCreators>>
export type ConnectCreator = (states: StateMap<any>, actionCreators: ActionCreators) => React.ComponentClass<any>
export type Plug = (app: App, name?: string) => any
export enum EffectType {
  watcher = 'watcher',
  takeEvery = 'takeEvery',
  takeLatest = 'takeLatest',
  throttle = 'throttle',
  debounce = 'debounce',
}
export type Watcher = <T extends unknown[]>(...args: T) => Iterator<any>
export type WatcherConfig = {
  watcher: Watcher
}

export type Saga = <A extends Action<any, any>>(action: A) => Iterator<any>
export type SagaConfig = SagaConfig1 | SagaConfig2

export type SagaConfig1 = {
  takeEvery: Saga
  namespace?: string
}
export type SagaConfig2 = {
  takeLatest: Saga
  namespace?: string
}
export type SagaConfig3 = {
  throttle: Saga
  ms: number
  namespace?: string
}
export type SagaConfig4 = {
  debounce: Saga
  ms: number
  namespace?: string
}

export interface NamedEffects {
  [key: string]: Saga | SagaConfig1 | SagaConfig2 | SagaConfig3 | SagaConfig4 | WatcherConfig
}

export interface AppConfig {
  mode?: 'production' | 'development'
  externalReducers?: Redux.ReducersMapObject
  externalEffects?: Watcher[]
  externalMiddlewares?: Middleware[]
}

const createSaga = (modelSagas: NamedEffects) => function* watcher() {
  yield all(Object.keys(modelSagas).map(actionType => {
    const sagaConfig = modelSagas[actionType]
    if ('takeEvery' in sagaConfig) {
      return takeEvery(actionType, sagaConfig.takeEvery)
    } else if ('takeLatest' in sagaConfig) {
      return takeLatest(actionType, sagaConfig.takeLatest)
    } else if ('throttle' in sagaConfig) {
      return throttle(sagaConfig.ms, actionType, sagaConfig.throttle)
    } else if ('watcher' in sagaConfig) {
      return call(sagaConfig.watcher)
    } else if ('debounce' in sagaConfig) {
      console.error('To implement')
    } else {
      return takeEvery(actionType, sagaConfig)
    }
  }))
}

function* safeFork(saga: () => IterableIterator<any>) {
  yield spawn(function* () {
    while (true) {
      try {
        yield call(saga)
        break
      } catch (e) {
        console.error(e)
      }
    }
  })
}

export class App {
  mergedReducers: Reducer[] = []
  rootReducers: Redux.ReducersMapObject
  states: StateMap<Record<string, any>> = {}
  effectsArray: NamedEffects[] = []
  actionCreators: ActionCreators = {}
  externalEffects: Watcher[]
  externalMiddlewares: Middleware[]
  registries: Map<string, React.ComponentType<any>> = Map()
  Layout: React.ComponentType<any>
  store: Redux.Store<Map<string, any>>
  mode: 'production' | 'development'

  constructor(props: AppConfig = {}) {
    // TODO: external effects
    this.rootReducers = {
      ...props.externalReducers,
      [Registry.namespace]: registryReducer,
      __root: () => true,
    }
    this.mode = props.mode || 'production'
    this.externalEffects = props.externalEffects || []
    this.externalMiddlewares = props.externalMiddlewares || []
  }

  model<T extends Record<string, any>>(namespace: string, initialState: T) {
    const stateClass = createState(namespace, initialState)
    this.states[namespace] = stateClass

    const mutationFunc = <P extends Record<string, Mutator<T>>>(mutationMap: P) => {

      // create action creators
      const actionCreators = typedActionCreators<T, typeof mutationMap>(namespace, mutationMap)
      this.actionCreators[namespace] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Record<string, Redux.Reducer> = {}
      Object.keys(mutationMap).forEach(key => {
        namedMutations[`${namespace}/${key}`] = (s: LocalState<T>, a: Redux.AnyAction) => mutationMap[key](...a.payload)(s)
      })

      this.rootReducers[namespace] = createReducer(stateClass.create(), namedMutations)
      if (this.store) {
        this.store.replaceReducer(combineReducers(this.rootReducers))
      }
      return actionCreators
    }

    const effectFunc = (effectMap: Record<string, Watcher | SagaConfig1 | SagaConfig2 | SagaConfig3 | SagaConfig4 | WatcherConfig>) => {
      const namedEffects: NamedEffects = {}
      Object.keys(effectMap).forEach(type => {
        const sagaConfig = effectMap[type]
        if (typeof sagaConfig === 'function') {
          namedEffects[`${namespace}/${type}`] = sagaConfig
        } else {
          if ('namespace' in sagaConfig) {
            namedEffects[`${sagaConfig.namespace}/${type}`] = sagaConfig
          } else {
            namedEffects[`${namespace}/${type}`] = sagaConfig
          }
        }
      })

      // dynamically register saga
      if (this.store) {
        sagaMiddleware.run(function* () {
          const saga = createSaga(namedEffects)
          yield call(safeFork, saga)
        })
      } else {
        this.effectsArray.push(namedEffects)
      }
    }

    return {
      state: stateClass,
      mutations: mutationFunc,
      effects: effectFunc,
    }
  }

  plugin(plug: Plug, name?: string) {
    plug(this, name)
  }

  register<T extends {}>(name: string, component: ComponentType<T>) {
    if (this.store) {
      this.store.dispatch(register(name, component))
    }
    this.registries = this.registries.set(name, component)
  }

  layout(Layout: React.ComponentType<any>) {
    this.Layout = Layout
  }

  hasModel(name: string) {
    return contains(name, Object.keys(this.states))
  }

  createRootSagas() {
    const sagas = this.effectsArray.map(createSaga).map(safeFork)
    const that = this
    return function* () {
      yield all([...sagas, ...that.externalEffects.map(effect => call(effect))])
    }
  }

  mergeReducers(reducers: Reducer[]) {
    this.mergedReducers = reducers
  }

  createStore() {
    const rootSagas = this.createRootSagas()
    const rootReducer = combineReducers(this.rootReducers)
    const reducer = (state: any, action: AnyAction) => {
      let s = rootReducer(state, action)
      this.mergedReducers.forEach(r => {
        s = r(s, action)
      })
      return s
    }
    const store = configureStore(reducer, [...this.externalMiddlewares, sagaMiddleware], this.mode)
    sagaMiddleware.run(rootSagas)
    this.store = store
    // initialize the component registry
    this.store.dispatch(registerAll(this.registries))
    return store
  }
}
