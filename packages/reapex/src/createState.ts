export type StateShape = Record<string, any>

export type GlobalState = Record<string, StateShape>

export type FieldSelectors<T extends StateShape> = {
  [K in keyof T]: (state: GlobalState) => T[K]
}

export type SelfSelector<T extends StateShape> = {
  self: (state: GlobalState) => T
}

export type Selectors<T extends StateShape> = FieldSelectors<T> & SelfSelector<T>

export interface StateObject<T extends StateShape> {
  get: <K extends keyof T>(k: K) => (s: GlobalState) => T[K]
  selectors: FieldSelectors<T> & SelfSelector<T>
  namespace: string
}

interface CreateState {
  <T extends StateShape>(namespace: string, fields: T): StateObject<T>
}

function isIterable<T>(
  value: T | IterableIterator<[keyof T, T[keyof T]]>
): value is IterableIterator<[keyof T, T[keyof T]]> {
  return Symbol.iterator in Object(value)
}

export const createState: CreateState = <T extends StateShape>(namespace: string, fields: T) => {
  const get = <K extends keyof T>(k: K) => (state: GlobalState) => {
    const localState = state[namespace] as T
    return localState[k]
  }

  const selectors = {} as FieldSelectors<T> & SelfSelector<T>

  // Support immutablejs Record as state
  if (isIterable(fields) && fields['@@__IMMUTABLE_RECORD__@@']) {
    for (const [k] of fields as IterableIterator<[keyof T, T[keyof T]]>) {
      selectors[k] = get(k) as any
    }
  } else {
    for (const k in fields) {
      selectors[k] = get(k) as any
    }
  }

  selectors.self = (state: GlobalState) => {
    const localState = state[namespace] as T
    return localState
  }

  return {
    get,
    namespace,
    selectors,
  }
}

export default createState
