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
  const store = createStore(reducers, applyMiddleware(...middlewares))
  // store.dispatch({ type: ActionTypes.APP.MOUNT })
  return store
}
