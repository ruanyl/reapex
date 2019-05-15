import Redux, { Middleware, Reducer } from 'redux'
import { contains } from 'ramda'
import { takeEvery, call, all, spawn, takeLatest, throttle, apply, debounce } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, StateObject, LocalState } from 'immutable-state-creator'
import { createReducer, AnyAction } from 'reducer-tools'
import { Map } from 'immutable'

import { typedActionCreators, Action, typedActionCreatorsForEffects } from './createActions'
import { configureStore } from './store'
import sagaMiddleware from './createSagaMiddleware';

export type Mutator<T> = (...payload: any[]) => (localstate: LocalState<T>) => LocalState<T>
export type StateMap<T extends Record<string, any>> = Record<string, StateObject<T>>
export type ActionCreators = Record<string, ReturnType<typeof typedActionCreators>>
export type Plug = (app: App, ...args: any[]) => any
export enum EffectType {
  watcher = 'watcher',
  takeEvery = 'takeEvery',
  takeLatest = 'takeLatest',
  throttle = 'throttle',
  debounce = 'debounce',
}
export type Watcher = () => IterableIterator<any>
export type WatcherConfig = {
  watcher: Watcher
}

export type Saga<T = any> = (action?: Action<T, any>) => IterableIterator<any>

export type SagaConfig1 = {
  takeEvery: Saga
}
export type SagaConfig2 = {
  takeLatest: Saga
}
export type SagaConfig3 = {
  throttle: Saga
  ms: number
}
export type SagaConfig4 = {
  debounce: Saga
  ms: number
}

export type Trigger = (...args: any[]) => IterableIterator<any>
export type TriggerConfig1 = {
  takeEvery: Trigger
}
export type TriggerConfig2 = {
  takeLatest: Trigger
}
export interface TriggerMapInput {
  [key: string]: TriggerConfig1 | TriggerConfig2
}

export interface EffectMapInput {
  [key: string]: Saga | SagaConfig1 | SagaConfig2 | SagaConfig3 | SagaConfig4 | WatcherConfig
}

export interface EffectMap {
  [key: string]: Saga | SagaConfig1 & { trigger: false }
    | SagaConfig2 & { trigger: false }
    | SagaConfig3 & { trigger: false }
    | SagaConfig4 & { trigger: false }
    | WatcherConfig & { trigger: false }
    | TriggerConfig1 & { trigger: true }
    | TriggerConfig2 & { trigger: true }
}

export interface AppConfig {
  mode?: 'production' | 'development'
  externalReducers?: Redux.ReducersMapObject
  externalEffects?: Watcher[]
  externalMiddlewares?: Middleware[]
}

const createSaga = (modelSagas: EffectMap) => function* watcher() {
  yield all(Object.keys(modelSagas).map(actionType => {
    const sagaConfig = modelSagas[actionType]
    const wrapper = (f: Saga) => {
      return function* (action: Action<any, any>) {
        yield apply(null, f, action.payload)
      }
    }
    if ('takeEvery' in sagaConfig) {
      return takeEvery(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeEvery) : sagaConfig.takeEvery)
    } else if ('takeLatest' in sagaConfig) {
      return takeLatest(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeLatest) : sagaConfig.takeLatest)
    } else if ('throttle' in sagaConfig) {
      return throttle(sagaConfig.ms, actionType, sagaConfig.throttle)
    } else if ('watcher' in sagaConfig) {
      return call(sagaConfig.watcher)
    } else if ('debounce' in sagaConfig) {
      return debounce(sagaConfig.ms, actionType, sagaConfig.debounce)
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
  effectsArray: EffectMap[] = []
  actionCreators: ActionCreators = {}
  externalEffects: Watcher[]
  externalMiddlewares: Middleware[]
  store: Redux.Store<Map<string, any>>
  mode: 'production' | 'development'

  constructor(props: AppConfig = {}) {
    // TODO: external effects
    this.rootReducers = {
      ...props.externalReducers,
      __root: () => true,
    }
    this.mode = props.mode || 'production'
    this.externalEffects = props.externalEffects || []
    this.externalMiddlewares = props.externalMiddlewares || []
  }

  model<T extends Record<string, any>>(namespace: string, initialState: T) {
    const stateClass = createState(namespace, initialState)
    this.states[namespace] = stateClass as StateObject<Record<string, any>>

    const mutationFunc = <P extends Record<string, Mutator<T>>, S extends Record<string, Mutator<T>>>(mutationMap: P, subscriptions?: S) => {

      // create action creators
      const actionCreators = typedActionCreators<T, typeof mutationMap>(namespace, mutationMap)
      this.actionCreators[namespace] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Record<string, Redux.Reducer> = {}
      Object.keys(mutationMap).forEach(key => {
        namedMutations[`${namespace}/${key}`] = (s: LocalState<T>, a: Redux.AnyAction) => mutationMap[key](...a.payload)(s)
      })

      if (subscriptions) {
        Object.keys(subscriptions).forEach(key => {
          namedMutations[key] = (s: LocalState<T>, a: Redux.AnyAction) => subscriptions[key](...a.payload)(s)
        })
      }

      this.rootReducers[namespace] = createReducer(stateClass.create(), namedMutations)
      if (this.store) {
        this.store.replaceReducer(this.getReducer())
      }
      return actionCreators
    }

    const effectFunc = <S extends EffectMapInput, P extends TriggerMapInput>(effectMap: S, triggerMap: P = {} as P) => {
      const namedEffects: EffectMap = {}
      Object.keys(effectMap).forEach(key => {
        const sagaConfig = effectMap[key]
        const hasNamespace = key.includes('/')
        const namespaceKey = hasNamespace ? key : `${namespace}/${key}`

        if (typeof sagaConfig === 'function') {
          namedEffects[`${namespaceKey}`] = sagaConfig
        } else {
          namedEffects[`${namespaceKey}`] = { ...sagaConfig, trigger: false }
        }
      })

      // TODO: check that keyof triggerMap should NOT in keyof effectMap

      const effectAcrionCreators = typedActionCreatorsForEffects(`${namespace}/effects`, triggerMap)

      Object.keys(triggerMap).forEach(key => {
        const triggerConfig = triggerMap[key]
        namedEffects[`${namespace}/effects/${key}`] = { ...triggerConfig, trigger: true }
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
      return effectAcrionCreators
    }

    return {
      state: stateClass,
      mutations: mutationFunc,
      effects: effectFunc,
    }
  }

  plugin<T extends Plug>(plug: T, ...args: any[]): ReturnType<typeof plug> {
    return plug(this, ...args)
  }

  hasModel(name: string) {
    return contains(name, Object.keys(this.states))
  }

  createRootSagas() {
    const sagas = this.effectsArray.map(createSaga).map(safeFork)
    return function* () {
      yield all(sagas)
    }
  }

  mergeReducers(reducers: Reducer[]) {
    this.mergedReducers = reducers
  }

  getReducer() {
    const rootReducer = combineReducers(this.rootReducers)
    const reducer = (state: any, action: AnyAction) => {
      let s = rootReducer(state, action)
      this.mergedReducers.forEach(r => {
        s = r(s, action)
      })
      return s
    }
    return reducer
  }

  createStore() {
    const rootSagas = this.createRootSagas()
    const reducer = this.getReducer()
    const store = configureStore(reducer, [...this.externalMiddlewares, sagaMiddleware], this.mode)
    sagaMiddleware.run(rootSagas)
    this.externalEffects.forEach(effect => {
      sagaMiddleware.run(effect)
    })
    this.store = store
    return store
  }
}
