import { Map } from 'immutable'
import { AnyAction, applyMiddleware, createStore, Middleware, Reducer, Store } from 'redux'

export const configureStore = (
  reducers: Reducer,
  middlewares: Middleware[],
  initialState?: Map<string, any> | Record<string, any>
): Store<any, AnyAction> => {
  let store: Store<any, AnyAction>
  if (process.env.NODE_ENV === 'development') {
    try {
      require.resolve('redux-devtools-extension')
      const composeWithDevTools = require('redux-devtools-extension').composeWithDevTools
      store = createStore(reducers, initialState, composeWithDevTools(applyMiddleware(...middlewares)))
    } catch (e) {
      store = createStore(reducers, initialState, applyMiddleware(...middlewares))
    }
  } else {
    store = createStore(reducers, initialState, applyMiddleware(...middlewares))
  }
  return store
}
