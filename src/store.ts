import { createStore, applyMiddleware, Reducer, Store, AnyAction, Middleware } from 'redux'
import { createLogger } from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension'

export const configureStore = (
  reducers: Reducer,
  middlewares: Middleware[],
  mode: 'production' | 'development',
  loggerEnabled: boolean = true,
  devtoolEnabled: boolean = true,
): Store<any, AnyAction> => {

  const hasLogger = mode === 'production' ? false : loggerEnabled
  const hasDevtool = mode === 'production' ? false : devtoolEnabled

  if (hasLogger) {
    const logger = createLogger({
      stateTransformer: (state: any) => state.toJS(),
    })
    middlewares = [...middlewares, logger]
  }

  const store = createStore(
    reducers,
    hasDevtool ? composeWithDevTools(applyMiddleware(...middlewares)) : applyMiddleware(...middlewares)
  )
  // store.dispatch({ type: ActionTypes.APP.MOUNT })
  return store
}
