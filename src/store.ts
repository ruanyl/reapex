import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware, Reducer, Store, AnyAction } from 'redux'
import { createLogger } from 'redux-logger'

const sagaMiddleware = createSagaMiddleware()
let middlewares: any[] = [sagaMiddleware]

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    stateTransformer: (state: any) => state.toJS(),
  })
  middlewares = [...middlewares, logger]
}

export const configureStore = (reducers: Reducer, sagas: any, preloadedState: any = undefined): Store<any, AnyAction> => {
  const store = createStore(
    reducers,
    preloadedState,
    applyMiddleware(...middlewares)
  )
  sagaMiddleware.run(sagas)
  // store.dispatch({ type: ActionTypes.APP.MOUNT })
  return store
}
