import {
  AnyAction,
  applyMiddleware,
  createStore,
  Middleware,
  Reducer,
  Store,
} from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createLogger } from 'redux-logger'

import { AppConfig } from './app'

export const configureStore = (
  reducers: Reducer,
  middlewares: Middleware[],
  appConfig: AppConfig
): Store<any, AnyAction> => {
  const hasLogger =
    appConfig.mode === 'production' ? false : appConfig.loggerEnabled
  const hasDevtool =
    appConfig.mode === 'production' ? false : appConfig.devtoolEnabled

  if (hasLogger) {
    const logger = createLogger({
      stateTransformer: (state: any) => state.toJS(),
    })
    middlewares = [...middlewares, logger]
  }

  const store = createStore(
    reducers,
    hasDevtool
      ? composeWithDevTools(applyMiddleware(...middlewares))
      : applyMiddleware(...middlewares)
  )
  // store.dispatch({ type: ActionTypes.APP.MOUNT })
  return store
}
