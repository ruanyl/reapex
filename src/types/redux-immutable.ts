declare module 'redux-immutable' {
  import * as Redux from 'redux'
  import { Collection } from 'immutable'

  export function combineReducers<S, T>(reducers: Redux.ReducersMapObject, getDefaultState?: () => Collection.Keyed<T, S>): Redux.Reducer<S>;
  export function combineReducers<S>(reducers: Redux.ReducersMapObject, getDefaultState?: () => Collection.Indexed<S>): Redux.Reducer<S>;
}

