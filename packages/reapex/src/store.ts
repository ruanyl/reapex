import { AnyAction, applyMiddleware, legacy_createStore as createStore, Middleware, Reducer, Store } from 'redux'

let composeWithDevTools: any

if (process.env.NODE_ENV === 'development') {
  try {
    composeWithDevTools = require('redux-devtools-extension').composeWithDevTools
  } catch (e) {
    console.warn('You may want: redux-devtools-extension(https://github.com/zalmoxisus/redux-devtools-extension)')
  }
}

export const configureStore = (
  reducers: Reducer,
  middlewares: Middleware[],
  initialState?: Record<string, any>
): Store<any, AnyAction> => {
  let store: Store<any, AnyAction>
  if (composeWithDevTools) {
    composeWithDevTools = require('redux-devtools-extension').composeWithDevTools
    store = createStore(reducers, initialState, composeWithDevTools(applyMiddleware(...middlewares)))
  } else {
    store = createStore(reducers, initialState, applyMiddleware(...middlewares))
  }
  return store
}
