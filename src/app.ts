import React from 'react'
import { contains } from 'ramda'
import { takeEvery, call, all } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, StateObject, LocalState } from 'immutable-state-creator'
import { createReducer } from 'reducer-tools'
import { Map } from 'immutable'
import * as Redux from 'redux'

import { typedActionCreators, ActionMap } from './createActions'
import { configureStore } from './store'
import { Registry, registryReducer, register, registerAll, DeferredComponent } from './registry'

export type MutatorMap<T> = Record<string, Mutator<T>>
export type Mutator<T> = (...payload: any[]) => (localstate: LocalState<T>) => LocalState<T>

export interface Config<T extends Record<string, any>> {
  mutations: <P extends Record<string, Mutator<T>>>(state: StateObject<T>) => P extends Record<string, Mutator<T>> ? { [K in keyof P]: P[K] } : never;
  effects?: (states: StateMap<T>) => Record<string, () => IterableIterator<any>>;
}

export type StateMap<T extends Record<string, any>> = Record<string, StateObject<T>>

export type ActionCreators = Record<string, ReturnType<typeof typedActionCreators>>

export type ConnectCreator = (states: StateMap<any>, actionCreators: ActionCreators) => React.ComponentClass<any>

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
  states: StateMap<Record<string, any>> = {}
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

  model<T extends Record<string, any>>(namespace: string, initialState: T) {
    const stateClass = createState(name, initialState)
    this.states[namespace] = stateClass

    // const mutationFunc = <M extends Record<string, (...payload: any[]) => (localState: LocalState<T>) => any>>(mutations: (state: StateObject<T>) => { [K in keyof M]: M[K] }) => {
    const mutationFunc = <M extends Record<string, any>>(mutations: (state: StateObject<T>) => { [K in keyof M]: M[K] }) => {
      const mutationMap = mutations(stateClass)

      // create action creators
      const actionCreators = typedActionCreators<ReturnType<typeof mutations>>(namespace, mutations as any)
      this.actionCreators[namespace] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Record<string, Redux.Reducer> = {}
      Object.keys(mutationMap).forEach(key => {
        namedMutations[`${namespace}/${key}`] = (s: LocalState<T>, a: Redux.AnyAction) => mutationMap[key](a.payload)(s);
      })

      this.rootReducers[namespace] = createReducer(stateClass.create(), namedMutations)
      if (this.store) {
        this.store.replaceReducer(combineReducers(this.rootReducers))
      }
      return actionCreators
    }

    const effectFunc = (effects: (states: StateMap<T>) => Record<string, () => IterableIterator<any>>) => {
      const effectsCreator = (states: Record<string, any>) => {
        const effectMap = effects!(states)
        const namedEffects: NamedEffects = {}
        Object.keys(effectMap).forEach(type => {
          const paths = type.split('/');
          if (paths.length > 1 && this.hasModel(paths[0])) {
            namedEffects[type] = effectMap[type]
          } else {
            namedEffects[`${namespace}/${type}`] = effectMap[type]
          }
        })
        return namedEffects
      }
      this.effectCreators.push(effectsCreator)
    }

    return {
      state: stateClass,
      mutations: mutationFunc,
      effects: effectFunc,
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
