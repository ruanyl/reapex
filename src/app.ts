import createSagaMiddleware, { SagaMiddleware } from 'redux-saga'
import { Map } from 'immutable'
import {
  createState,
  Selectors,
  State,
  StateObject,
} from 'immutable-state-creator'
import { createReducer, Mirrored } from 'reducer-tools'
import { AnyAction, Middleware, Reducer, ReducersMapObject, Store } from 'redux'
import { combineReducers } from 'redux-immutable'
import { all } from 'redux-saga/effects'

import {
  typedActionCreators,
  typedActionCreatorsForEffects,
} from './createActions'
import { createSaga, safeFork } from './sagaHelpers'
import { configureStore } from './store'
import {
  ActionCreatorMap,
  ActionCreatorMapForEffects,
  AnyActionCreator,
  EffectMap,
  EffectMapInput,
  MutatorInput,
  StateMap,
  SubscriberInput,
  TriggerMapInput,
  Watcher,
} from './types'
import { actionTypeHasNamespace as defaultActionTypeHasNamespace } from './utils'

export interface AppConfig {
  middlewares: Middleware[]
  actionTypeHasNamespace: (actionType: string) => boolean
}
export type Plug = (app: App, ...args: any[]) => any

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
  states: StateMap<Record<string, any>> = {}
  effectsArray: EffectMap[] = []
  actionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  effectActionCreators: Record<string, Record<string, AnyActionCreator>> = {}
  selectors: Record<string, Selectors<Record<string, any>>> = {}
  store: Store<Map<string, any>>
  sagaMiddleware: SagaMiddleware<any>

  appConfig: AppConfig = {
    middlewares: [],
    actionTypeHasNamespace: defaultActionTypeHasNamespace,
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
          actionTypeHasNamespace(actionType) ||
          defaultActionTypeHasNamespace(actionType),
      }
    }
  }

  model<T extends Record<string, any>>(namespace: string, initialState: T) {
    const stateClass = createState(namespace, initialState)
    this.states[namespace] = stateClass as StateObject<Record<string, any>>
    /* eslint-disable @typescript-eslint/indent */
    this.selectors[namespace] = stateClass.selectors as Selectors<
      Record<string, any>
    >

    const mutationFunc = <
      P extends MutatorInput<T>,
      S extends SubscriberInput<T>
    >(
      mutationMap: P,
      subscriptions?: S
    ): [ActionCreatorMap<T, P>, Mirrored<P>] => {
      // create action creators
      const [actionCreators, actionTypes] = typedActionCreators<
        T,
        typeof mutationMap
      >(namespace, mutationMap)
      this.actionCreators[namespace] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Record<string, Reducer> = {}
      Object.keys(mutationMap).forEach(key => {
        namedMutations[`${namespace}/${key}`] = (s: State<T>, a: AnyAction) =>
          mutationMap[key](...a.payload)(s)
      })

      if (subscriptions) {
        Object.keys(subscriptions).forEach(key => {
          namedMutations[key] = (s: State<T>, a: AnyAction) =>
            subscriptions[key](a)(s)
        })
      }

      this.rootReducers[namespace] = createReducer(
        stateClass.create(),
        namedMutations
      )
      if (this.store) {
        this.store.replaceReducer(this.getReducer())
        this.store.dispatch(mutationsLoaded(namespace))
      }
      return [actionCreators, actionTypes]
    }

    const effectFunc = <P extends EffectMapInput, S extends TriggerMapInput>(
      effectMap: P,
      triggerMap: S = {} as S
    ): [ActionCreatorMapForEffects<S>, Mirrored<S>] => {
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

      const [effectAcrionCreators, actionTypes] = typedActionCreatorsForEffects(
        `${namespace}`,
        triggerMap
      )
      this.effectActionCreators[namespace] = effectAcrionCreators

      Object.keys(triggerMap).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(effectMap, key)) {
          throw new Error(
            `${namespace}.effects(), key: ${key} in ${JSON.stringify(
              triggerMap
            )} also appears in ${JSON.stringify(effectMap)}`
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
      return [effectAcrionCreators, actionTypes]
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

  plugin<T extends Plug>(plug: T, ...args: any[]): ReturnType<typeof plug> {
    return plug(this, ...args)
  }

  use<T extends Plug>(logic: T, ...args: any[]): ReturnType<typeof logic> {
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
      const rootReducer = combineReducers(this.rootReducers)
      return rootReducer
    } else {
      return (() => Map()) as Reducer<any, AnyAction>
    }
  }

  createStore() {
    const rootSagas = this.createRootSagas()
    const reducer = this.getReducer()
    this.sagaMiddleware = createSagaMiddleware()
    const store = configureStore(reducer, [
      ...this.appConfig.middlewares,
      this.sagaMiddleware,
    ])
    this.sagaMiddleware.run(rootSagas)
    this.store = store
    return store
  }
}
