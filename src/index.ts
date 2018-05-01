import { T } from 'ramda'
import { takeEvery, call } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, Dictionary } from 'immutable-state-creator'
import { createReducer } from 'reducer-tools'

import configureStore from './store'

interface Model {
  name: string;
  fields: Dictionary;
  reducers: any;
  effects: any;
}

const createSaga = (modelSagas: any) => function* watcher() {
  // TODO: needs to have the flexibility to choose takeEvery, takeLatest...
  yield Object.keys(modelSagas).map(action => takeEvery(action, modelSagas[action]))
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

  model(config: Model) {
    const stateClass = createState({ name: config.name, fields: config.fields })
    const modelReducers = config.reducers(stateClass)
    this.states[name] = stateClass
    this.rootReducers[name] = createReducer(stateClass.create(), modelReducers)
    this.effectCreators.push(config.effects)
  }

  use(stateClassesSelector: any) {
    return stateClassesSelector(this.states)
  }

  createRootSagas() {
    return function* () {
      yield this.effectCreators.map((ec: any) => ec(this.states)).map(createSaga).map(safeFork)
    }
  }

  createStore() {
    const rootSagas = this.createRootSagas()
    const store = configureStore(combineReducers(this.rootReducers), rootSagas)
    return store
  }
}
