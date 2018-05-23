import { contains } from 'ramda'
import { takeEvery, call, all } from 'redux-saga/effects'
import { combineReducers } from 'redux-immutable'
import { createState, Dictionary, StateObject } from 'immutable-state-creator'
import { createReducer } from 'reducer-tools'
import { Map } from 'immutable'
import { Store } from 'redux'

import { createActions } from './createActions'
import { configureStore } from './store'
import { Registry, registryReducer, register, registerAll } from './registry'

export interface Model<T> {
  name: string;
  fields: T;
  mutations?: (State: StateObject<T>) => any;
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
  rootReducers: Dictionary
  states: any = {}
  effectCreators: any[] = []
  actionCreators: Dictionary = {}
  registries: Map<string, React.ComponentType<any>> = Map()
  Layout: React.ComponentType<any>
  store: Store<Map<string, any>>

  constructor(props: any = {}) {
    this.rootReducers = {
      ...props.externalReducers,
      [Registry.name]: registryReducer,
      __root: () => true,
    }
  }

  model<T extends Dictionary>(config: Model<T>) {
    const stateClass = createState<T>({ name: config.name, fields: config.fields })
    this.states[config.name] = stateClass

    if (config.mutations) {
      const mutations = config.mutations(stateClass)

      // create action creators
      const createActionsForCurrentName = createActions(config.name)
      const actionCreators = createActionsForCurrentName(mutations)
      this.actionCreators[config.name] = actionCreators

      // reducer map which key is prepend with namespace
      const namedMutations: Dictionary = {}
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
    }

    if (config.effects) {
      const effectsCreator = (states: any) => {
        const effects = config.effects(states)
        const namedEffects: Dictionary = {}
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

  use(stateClassesSelector: any) {
    return stateClassesSelector(this.states, this.actionCreators)
  }

  register(name: string, component: React.ComponentType<any>) {
    if (this.store) {
      this.store.dispatch(register(name, component))
    }
    this.registries = this.registries.set(name, component)
  }

  layout(Layout: React.ComponentType<any>) {
    this.Layout = Layout
  }

  hasModel(name: string): boolean {
    return contains(name, Object.keys(this.states))
    // return Object.keys(this.states).includes(name)
  }

  createRootSagas(): any {
    const sagas = this.effectCreators.map((ec: any) => ec(this.states)).map(createSaga).map(safeFork)
    return function* () {
      yield all(sagas)
    }
  }

  createStore(): Store {
    const rootSagas = this.createRootSagas()
    const store = configureStore(combineReducers(this.rootReducers), rootSagas)
    this.store = store
    // initialize the component registry
    this.store.dispatch(registerAll(this.registries))
    return store
  }
}
