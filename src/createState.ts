import { Map, Record as ImmutableRecord } from 'immutable'

export type StateShape = Record<string, any>

export type GlobalState = Record<string, StateShape> | Map<string, ImmutableRecord<StateShape>>

export type State<T = StateShape> = T | ImmutableRecord<T>

export type FieldSelectors<T extends StateShape> = {
  [K in keyof T]: (state: GlobalState) => T[K]
}

export type SelfSelector<S extends State> = {
  self: (state: GlobalState) => S
}

export type Selectors<T extends StateShape, S extends State<T>> = FieldSelectors<T> & SelfSelector<S>

export interface StateObject<T extends StateShape, S extends State<T>> {
  get: <K extends keyof T>(k: K) => (s: GlobalState) => T[K]
  selectors: FieldSelectors<T> & SelfSelector<S>
  namespace: string
}

interface CreateState {
  <T extends StateShape>(namespace: string, fields: T): StateObject<T, T>
  <T extends StateShape>(namespace: string, fields: ImmutableRecord<T>): StateObject<T, ImmutableRecord<T>>
}

export const createState: CreateState = <T extends StateShape>(namespace: string, fields: State<T>) => {
  const initial: T = ImmutableRecord.isRecord(fields) ? fields.toObject() : fields

  const get = <K extends keyof T>(k: K) => (state: GlobalState) => {
    const localState = Map.isMap(state) ? (state.get(namespace) as ImmutableRecord<T>) : (state[namespace] as T)
    return ImmutableRecord.isRecord(localState) ? (localState as ImmutableRecord<T>).get(k) : (localState as T)[k]
  }

  const selectors = {} as FieldSelectors<T> & SelfSelector<State<T>>

  for (const k in initial) {
    // @ts-ignore
    selectors[k] = get(k)
  }

  selectors['self'] = (state: GlobalState) => {
    const localState = Map.isMap(state) ? state.get(namespace) : state[namespace]
    return localState as State<T>
  }

  return {
    get,
    namespace,
    selectors,
  }
}

export default createState
