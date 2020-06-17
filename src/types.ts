import { Action as ReduxAction } from 'redux'
import { SagaIterator } from 'redux-saga'

import { State, StateObject, StateShape } from './createState'

export type Mutator<T> = (...payload: any[]) => (localstate: T) => T

export interface MutatorInput<T> {
  [key: string]: Mutator<T>
}

export type Subscriber<T, A extends ReduxAction> = {
  bivarianceHack(action: A): (localstate: T) => T
}['bivarianceHack']

export interface SubscriberInput<T> {
  [key: string]: Subscriber<T, ReduxAction>
}

export type StateMap<T extends StateShape> = Record<string, StateObject<T, State<T>>>
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

export type Saga<T = any> = ((action: Action<T, any>) => SagaIterator) | AnySaga<ReduxAction> | (() => SagaIterator)

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

export type SagaConfig5 = {
  takeLeading: Saga
}

export type Trigger = (...args: any[]) => SagaIterator
export type TriggerConfig1 = {
  takeEvery: Trigger
}
export type TriggerConfig2 = {
  takeLatest: Trigger
}
export type TriggerConfig3 = {
  throttle: Trigger
  ms: number
}
export type TriggerConfig4 = {
  debounce: Trigger
  ms: number
}
export type TriggerConfig5 = {
  takeLeading: Trigger
}
export interface TriggerMapInput {
  [key: string]: TriggerConfig1 | TriggerConfig2 | TriggerConfig3 | TriggerConfig4 | TriggerConfig5
}

export interface EffectMapInput {
  [key: string]: Saga | SagaConfig1 | SagaConfig2 | SagaConfig3 | SagaConfig4 | SagaConfig5 | WatcherConfig
}

export interface EffectMap {
  [key: string]:
    | Saga
    | (SagaConfig1 & { trigger: false })
    | (SagaConfig2 & { trigger: false })
    | (SagaConfig3 & { trigger: false })
    | (SagaConfig4 & { trigger: false })
    | (SagaConfig5 & { trigger: false })
    | (WatcherConfig & { trigger: false })
    | (TriggerConfig1 & { trigger: true })
    | (TriggerConfig2 & { trigger: true })
    | (TriggerConfig3 & { trigger: true })
    | (TriggerConfig4 & { trigger: true })
    | (TriggerConfig5 & { trigger: true })
}

export type ActionCreatorMap<P extends Record<string, Mutator<any>>> = {
  [K in keyof P]: (...payload: Parameters<P[K]>) => Action<K, Parameters<P[K]>>
}

export type ActionCreatorMapForEffects<P extends TriggerMapInput> = {
  [K in keyof P]: P[K] extends TriggerConfig1
    ? (...payload: Parameters<P[K]['takeEvery']>) => Action<K, Parameters<P[K]['takeEvery']>>
    : P[K] extends TriggerConfig2
    ? (...payload: Parameters<P[K]['takeLatest']>) => Action<K, Parameters<P[K]['takeLatest']>>
    : P[K] extends TriggerConfig3
    ? (...payload: Parameters<P[K]['throttle']>) => Action<K, Parameters<P[K]['throttle']>>
    : P[K] extends TriggerConfig4
    ? (...payload: Parameters<P[K]['debounce']>) => Action<K, Parameters<P[K]['debounce']>>
    : P[K] extends TriggerConfig5
    ? (...payload: Parameters<P[K]['takeLeading']>) => Action<K, Parameters<P[K]['takeLeading']>>
    : never
}
