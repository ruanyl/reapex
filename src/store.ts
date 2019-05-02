import { createStore, applyMiddleware, Reducer, Store, AnyAction, Middleware } from 'redux'
import { createLogger } from 'redux-logger'

export const configureStore = (reducers: Reducer, middlewares: Middleware[], mode: 'production' | 'development'): Store<any, AnyAction> => {

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
  // store.dispatch({ type: ActionTypes.APP.MOUNT })
  return store
}
