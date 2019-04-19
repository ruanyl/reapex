import { createStore, applyMiddleware, Reducer, Store, AnyAction } from 'redux'
import { createLogger } from 'redux-logger'

import sagaMiddleware from './createSagaMiddleware'

let middlewares: any[] = [sagaMiddleware]

export const configureStore = (reducers: Reducer, sagas: any, mode: 'production' | 'development'): Store<any, AnyAction> => {

  if (mode === 'development') {
    const logger = createLogger({
      stateTransformer: (state: any) => state.toJS(),
    })
    middlewares = [...middlewares, logger]
  }

  const store = createStore(
    reducers,
    applyMiddleware(...middlewares)
  )
  sagaMiddleware.run(sagas)
  // store.dispatch({ type: ActionTypes.APP.MOUNT })
  return store
}
