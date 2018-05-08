import { Reducer } from 'redux'
import { Dictionary } from 'immutable-state-creator'
import { pickBy, mapObjIndexed, compose, head, tail, join, converge, map, keys, values, zipObj } from 'ramda'

interface ReducerMap {
  [key: string]: Reducer;
}

type Modifier = (key: string) => string

const hasPrefix = (prefix: string) => (val: any, key: string) => key.indexOf(prefix) === 0

const dropPrefix = (prefix: string) => (str: string, separator: string = '/') => {
  const arr = str.split(separator)
  if (head(arr) === prefix) {
    return join('/', tail(arr))
  }
  return str
}

const modifyObjKeys = (modifier: Modifier) => converge(zipObj, [compose(map(modifier), keys), values])

export const createAction = (val: any, key: string) => (payload: any) => ({ type: key, payload })

export const createActions = (name: string) => compose(modifyObjKeys(dropPrefix(name)), mapObjIndexed(createAction), pickBy(hasPrefix(name)))
