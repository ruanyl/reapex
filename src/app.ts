import React from 'react'
import { contains } from 'ramda'
import { takeEvery, call, all } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, StateObject } from 'immutable-state-creator'
import { createReducer } from 'reducer-tools'
import { Map } from 'immutable'
import * as Redux from 'redux'

import { createActions } from './createActions'
import { configureStore } from './store'
import { Registry, registryReducer, register, registerAll, DeferredComponent } from './registry'

export interface Model<T extends Record<string, any>> {
  name: string;
  fields: T;
  mutations?: (state: StateObject<T, keyof T>) => any;
  effects?: (states: StateMap) => Record<string, () => IterableIterator<any>>;
}

export type StateMap = Record<string, StateObject<Record<any, any>, keyof Record<string, any>>>

export type ActionCreators = Record<string, ReturnType<ReturnType<typeof createActions>>>

export type ConnectCreator = (states: StateMap, actionCreators: ActionCreators) => React.ComponentClass<any>

export type Plug = (app: App, name?: string) => any

export interface NamedEffects {
  [key: string]: () => IterableIterator<any>
}

export type EffectCreator = (states: Record<string, any>) => NamedEffects

const createSaga = (modelSagas: any) => function* watcher() {
  // TODO: needs to have the flexibility to choose takeEvery, takeLatest...
  yield all(Object.keys(modelSagas).map(action => takeEvery(action, modelSagas[action])))
}

function* safeFork(saga: any): any {
  try {
    yield call(saga)
  } catch (err) {
    console.error(`Uncaught error in ${saga.name}`)
    console.error(err)
    yield call(safeFork, saga)
  }
}

export class App {
  rootReducers: Redux.ReducersMapObject
  states: StateMap = {}
  effectCreators: EffectCreator[] = []
  actionCreators: ActionCreators = {}
  registries: Map<string, () => React.ComponentType<any>> = Map()
  Layout: React.ComponentType<any>
  store: Redux.Store<Map<string, any>>

  constructor(props: any = {}) {
    this.rootReducers = {
      ...props.externalReducers,
      [Registry.namespace]: registryReducer,
      __root: () => true,
    }
  }

  model<T extends Record<string, any>>(config: Model<T>) {
    const stateClass = createState<T, keyof T>(config.name, config.fields)
    this.states[config.name] = stateClass

    if (typeof config.mutations === 'function') {
      const mutations = config.mutations(stateClass)

      // create action creators
      const createActionsForCurrentName = createActions(config.name)
      const actionCreators = createActionsForCurrentName(mutations)
      this.actionCreators[config.name] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Record<string, any> = {}
      Object.keys(mutations).forEach(key => {
        const paths = key.split('/');
        // key doesn't have a namespace, then append the current namespace
        if (paths.length === 1) {
          namedMutations[`${config.name}/${key}`] = mutations[key];
        } else {
          namedMutations[key] = mutations[key];
        }
      })
      this.rootReducers[config.name] = createReducer(stateClass.create(), namedMutations)
      if (this.store) {
        this.store.replaceReducer(combineReducers(this.rootReducers))
      }
    }

    if (typeof config.effects === 'function') {
      const effectsCreator = (states: Record<string, any>) => {
        const effects = config.effects!(states)
        const namedEffects: NamedEffects = {}
        Object.keys(effects).forEach(type => {
          const paths = type.split('/');
          if (paths.length > 1 && this.hasModel(paths[0])) {
            namedEffects[type] = effects[type]
          } else {
            namedEffects[`${config.name}/${type}`] = effects[type]
          }
        })
        return namedEffects
      }
      this.effectCreators.push(effectsCreator)
    }
  }

  use(stateClassesSelector: ConnectCreator) {
    // deferred the initialize step util states are done
    return () => stateClassesSelector(this.states, this.actionCreators)
  }

  plug(plug: Plug, name?: string) {
    plug(this, name)
  }

  register(name: string, deferredComponent: DeferredComponent) {
    if (this.store) {
      this.store.dispatch(register(name, deferredComponent))
    }
    this.registries = this.registries.set(name, deferredComponent)
  }

  layout(Layout: React.ComponentType<any>) {
    this.Layout = Layout
  }

  hasModel(name: string) {
    return contains(name, Object.keys(this.states))
    // return Object.keys(this.states).includes(name)
  }

  createRootSagas() {
    const sagas = this.effectCreators.map((ec: any) => ec(this.states)).map(createSaga).map(safeFork)
    return function* () {
      yield all(sagas)
    }
  }

  createStore() {
    const rootSagas = this.createRootSagas()
    const store = configureStore(combineReducers(this.rootReducers), rootSagas)
    this.store = store
    // initialize the component registry
    this.store.dispatch(registerAll(this.registries))
    return store
  }
}
