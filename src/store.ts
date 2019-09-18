import {
  AnyAction,
  applyMiddleware,
  createStore,
  Middleware,
  Reducer,
  Store,
} from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

export const configureStore = (
  reducers: Reducer,
  middlewares: Middleware[],
): Store<any, AnyAction> => {
  let store: Store<any, AnyAction>;
  if (process.env.NODE_ENV === 'development') {
    store = createStore(reducers, composeWithDevTools(applyMiddleware(...middlewares)))
  } else {
    store = createStore(reducers, applyMiddleware(...middlewares))
  }
  return store
}
