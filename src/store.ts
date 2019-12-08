import {
  AnyAction,
  applyMiddleware,
  createStore,
  Middleware,
  Reducer,
  Store,
} from 'redux'

export const configureStore = (
  reducers: Reducer,
  middlewares: Middleware[]
): Store<any, AnyAction> => {
  let store: Store<any, AnyAction>
  if (process.env.NODE_ENV === 'development') {
    try {
      require.resolve('redux-devtools-extension')
      const composeWithDevTools = require('redux-devtools-extension')
        .composeWithDevTools
      store = createStore(
        reducers,
        composeWithDevTools(applyMiddleware(...middlewares))
      )
    } catch (e) {
      store = createStore(reducers, applyMiddleware(...middlewares))
    }
  } else {
    store = createStore(reducers, applyMiddleware(...middlewares))
  }
  return store
}
