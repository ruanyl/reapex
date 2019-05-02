import React, { ComponentType } from 'react'
import Redux, { Action, Middleware, Reducer } from 'redux'
import { contains } from 'ramda'
import { takeEvery, call, all, spawn, takeLatest, throttle } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, StateObject, LocalState } from 'immutable-state-creator'
import { createReducer, AnyAction } from 'reducer-tools'
import { Map } from 'immutable'

import { typedActionCreators } from './createActions'
import { configureStore } from './store'
import { Registry, registryReducer, register, registerAll } from './registry'
import sagaMiddleware from './createSagaMiddleware';

export type Mutator<T> = (...payload: any[]) => (localstate: LocalState<T>) => LocalState<T>
export type StateMap<T extends Record<string, any>> = Record<string, StateObject<T>>
export type ActionCreators = Record<string, ReturnType<typeof typedActionCreators>>
export type ConnectCreator = (states: StateMap<any>, actionCreators: ActionCreators) => React.ComponentClass<any>
export type Plug = (app: App, name?: string) => any

export type Watcher = (...args: any[]) => Iterator<any>
export interface WatcherConfig {
  type: 'watcher'
}
export type Saga = <A extends Action>(action: A) => Iterator<any>
export type SagaConfig = SagaConfig1 | SagaConfig2
export interface SagaConfig1 {
  type: 'takeEvery' | 'takeLatest' | null
  ms?: number
}
export interface SagaConfig2 {
  type: 'throttle' | 'debounce'
  ms: number
}
export interface NamedEffects {
  [key: string]: Saga | [Saga, SagaConfig] | [Watcher, WatcherConfig] | Watcher
}

export type EffectCreator = (states: Record<string, any>) => NamedEffects

export interface AppConfig {
  mode?: 'production' | 'development'
  externalReducers?: Redux.ReducersMapObject
  externalEffects?: Watcher[]
  externalMiddlewares?: Middleware[]
}

const createSaga = (modelSagas: NamedEffects) => function* watcher() {
  yield all(Object.keys(modelSagas).map(actionType => {
    const saga = modelSagas[actionType]
    if (Array.isArray(saga)) {
      const [sagaFunc, sagaConfig] = saga
      if (sagaConfig.type === 'takeEvery') {
        return takeEvery(actionType, sagaFunc)
      }
      if (sagaConfig.type === 'takeLatest') {
        return takeLatest(actionType, sagaFunc)
      }
      if (sagaConfig.type === 'throttle') {
        return throttle(sagaConfig.ms, sagaConfig.type, sagaFunc)
      }
      if (sagaConfig.type === 'watcher') {
        return call(sagaFunc as Watcher)
      }
    } else {
      return takeEvery(actionType, saga)
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
  effectCreators: EffectCreator[] = []
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

    const mutationFunc = <P extends Record<string, Mutator<T>>>(mutations: (state: StateObject<T>) => P) => {
      const mutationMap = mutations(stateClass)

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

    const effectFunc = <P extends StateMap<Record<string, any>>>(effects: (states: P) => Record<string, Saga | [Saga, SagaConfig] | [Watcher, WatcherConfig]>) => {
      const effectsCreator = (states: P) => {
        const effectMap = effects!(states)
        const namedEffects: NamedEffects = {}
        Object.keys(effectMap).forEach(type => {
          const paths = type.split('/')
          if (paths.length > 1 && this.hasModel(paths[0])) {
            namedEffects[type] = effectMap[type]
          } else {
            namedEffects[`${namespace}/${type}`] = effectMap[type]
          }
        })
        return namedEffects
      }
      // dynamically register saga
      if (this.store) {
        const states = this.states
        sagaMiddleware.run(function* () {
          const saga = createSaga(effectsCreator(states as P))
          yield call(safeFork, saga)
        })
      }
      this.effectCreators.push(effectsCreator)
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
    const sagas = this.effectCreators.map((ec: any) => ec(this.states)).map(createSaga).map(safeFork)
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
