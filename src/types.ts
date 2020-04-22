import { State, StateObject } from 'immutable-state-creator'
import { Action as ReduxAction } from 'redux'
import { SagaIterator } from 'redux-saga'

export type Mutator<T> = (
  ...payload: any[]
) => (localstate: State<T>) => State<T>

export interface MutatorInput<T> {
  [key: string]: Mutator<T>
}

export type Subscriber<T, A extends ReduxAction> = {
  bivarianceHack(action: A): (localstate: State<T>) => State<T>
}['bivarianceHack']

export interface SubscriberInput<T> {
  [key: string]: Subscriber<T, ReduxAction>
}

export type StateMap<T extends Record<string, any>> = Record<
  string,
  StateObject<T>
>
export type AnyActionCreator = (...payload: any[]) => Action<any, any[]>
export type Watcher = () => SagaIterator
export type WatcherConfig = {
  watcher: Watcher
}
export interface Action<T, P> {
  type: T
  payload: P
}

type AnySaga<A extends ReduxAction> = {
  bivarianceHack(action: A): SagaIterator
}['bivarianceHack']

export type Saga<T = any> =
  | ((action: Action<T, any>) => SagaIterator)
  | AnySaga<ReduxAction>
  | (() => SagaIterator)

export type SagaConfig1 = {
  takeEvery: Saga
}
export type SagaConfig2 = {
  takeLatest: Saga
}
export type SagaConfig3 = {
  throttle: Saga
  ms: number
}
export type SagaConfig4 = {
  debounce: Saga
  ms: number
}

export type Trigger = (...args: any[]) => SagaIterator
export type TriggerConfig1 = {
  takeEvery: Trigger
}
export type TriggerConfig2 = {
  takeLatest: Trigger
}
export interface TriggerMapInput {
  [key: string]: TriggerConfig1 | TriggerConfig2
}

export interface EffectMapInput {
  [key: string]:
    | Saga
    | SagaConfig1
    | SagaConfig2
    | SagaConfig3
    | SagaConfig4
    | WatcherConfig
}

export interface EffectMap {
  [key: string]:
    | Saga
    | (SagaConfig1 & { trigger: false })
    | (SagaConfig2 & { trigger: false })
    | (SagaConfig3 & { trigger: false })
    | (SagaConfig4 & { trigger: false })
    | (WatcherConfig & { trigger: false })
    | (TriggerConfig1 & { trigger: true })
    | (TriggerConfig2 & { trigger: true })
}

export type ActionCreatorMap<
  T extends Record<string, any>,
  P extends Record<string, Mutator<T>>
> = {
  [K in keyof P]: (...payload: Parameters<P[K]>) => Action<K, Parameters<P[K]>>
}

export type ActionCreatorMapForEffects<P extends TriggerMapInput> = {
  [K in keyof P]: P[K] extends TriggerConfig1
    ? (
        ...payload: Parameters<P[K]['takeEvery']>
      ) => Action<K, Parameters<P[K]['takeEvery']>>
    : P[K] extends TriggerConfig2
    ? (
        ...payload: Parameters<P[K]['takeLatest']>
      ) => Action<K, Parameters<P[K]['takeLatest']>>
    : never
}
