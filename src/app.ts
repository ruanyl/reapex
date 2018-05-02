import { T } from 'ramda'
import { takeEvery, call, all } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, Dictionary, StateObject } from 'immutable-state-creator'
import { createReducer } from 'reducer-tools'

import { configureStore } from './store'

export interface Model<T> {
  name: string;
  fields: T;
  reducers?: (State: StateObject<T>) => any;
  effects?: any;
}

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
  rootReducers: any

  states: any = {}
  effectCreators: any[] = []

  constructor(props: any = {}) {
    this.rootReducers = {
      ...props.externalReducers,
      __root: T,
    }
  }

  model<T extends Dictionary>(config: Model<T>) {
    const stateClass = createState<T>({ name: config.name, fields: config.fields })
    this.states[config.name] = stateClass
    this.effectCreators.push(config.effects)
    if (config.reducers) {
      const modelReducers = config.reducers(stateClass)
      this.rootReducers[config.name] = createReducer(stateClass.create(), modelReducers)
    }
  }

  use(stateClassesSelector: any) {
    return stateClassesSelector(this.states)
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
    return store
  }
}
