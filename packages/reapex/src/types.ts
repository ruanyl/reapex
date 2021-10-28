import { AnyAction } from 'redux'
import { SagaIterator } from 'redux-saga'
import { AsyncSeriesHook, SyncWaterfallHook } from 'tapable'

import { App } from './app'
import { Mirrored } from './utils'

export type GlobalState = Record<string, any>

export type SagaKind = 'EFFECT' | 'SUBSCRIPTION' | 'TRIGGER'

export type Mutator<T> = (...payload: any[]) => (localState: T) => T

export interface MutatorInput<T> {
  [key: string]: Mutator<T>
}

export type AnyActionCreator = (...payload: any[]) => Action<any, any[]>
export interface Action<T, P> {
  type: T
  payload: P
}

export type Saga = {
  bivarianceHack(action?: AnyAction): SagaIterator
}['bivarianceHack']

// Non generator function
type SagaNonGeneratorFunction = {
  bivarianceHack(action?: AnyAction): Promise<void> | void
}['bivarianceHack']

export type SagaConfig1 = {
  takeEvery: Saga | SagaNonGeneratorFunction
}
export type SagaConfig2 = {
  takeLatest: Saga
}
export type SagaConfig3 = {
  throttle: Saga | SagaNonGeneratorFunction
  ms: number
}
export type SagaConfig4 = {
  debounce: Saga | SagaNonGeneratorFunction
  ms: number
}

export type SagaConfig5 = {
  takeLeading: Saga | SagaNonGeneratorFunction
}

export type Trigger = (...args: any[]) => SagaIterator
export type TriggerNonGeneratorFunction = (...args: any[]) => Promise<void> | void

export type TriggerConfig1 = {
  takeEvery: Trigger | TriggerNonGeneratorFunction
}
export type TriggerConfig2 = {
  takeLatest: Trigger
}
export type TriggerConfig3 = {
  throttle: Trigger | TriggerNonGeneratorFunction
  ms: number
}
export type TriggerConfig4 = {
  debounce: Trigger | TriggerNonGeneratorFunction
  ms: number
}
export type TriggerConfig5 = {
  takeLeading: Trigger | TriggerNonGeneratorFunction
}
export interface TriggerMapInput {
  [key: string]:
    | TriggerNonGeneratorFunction
    | Trigger
    | TriggerConfig1
    | TriggerConfig2
    | TriggerConfig3
    | TriggerConfig4
    | TriggerConfig5
}

export interface EffectMapInput {
  [key: string]: SagaNonGeneratorFunction | Saga | SagaConfig1 | SagaConfig2 | SagaConfig3 | SagaConfig4 | SagaConfig5
}

export interface EffectMap {
  [key: string]:
    | (SagaConfig1 & { trigger: false })
    | (SagaConfig2 & { trigger: false })
    | (SagaConfig3 & { trigger: false })
    | (SagaConfig4 & { trigger: false })
    | (SagaConfig5 & { trigger: false })
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
    : P[K] extends Trigger
    ? (...payload: Parameters<P[K]>) => Action<K, Parameters<P[K]>>
    : P[K] extends TriggerNonGeneratorFunction
    ? (...payload: Parameters<P[K]>) => Action<K, Parameters<P[K]>>
    : never
}

export interface Hooks {
  readonly beforeMutation: SyncWaterfallHook<[Mutator<any>, any, string]>
  readonly afterMutationAsync: AsyncSeriesHook<[any, string]>
  readonly beforeModelInitialized: SyncWaterfallHook<[unknown, string]>
}

export type Plugin = (hooks: Hooks, app: App) => void

export interface Model<T, N extends string> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __APP__: App
  namespace: string
  mutations: <M extends MutatorInput<T>>(mutationMap: M) => readonly [ActionCreatorMap<M>, Mirrored<M, N>]
  subscriptions: <M extends EffectMapInput>(effectMap: M) => void
  effects: <M extends EffectMapInput>(effectMap: M) => void
  triggers: <TM extends TriggerMapInput>(
    triggerMap: TM
  ) => readonly [ActionCreatorMapForEffects<TM>, Mirrored<TM, `${N}/triggers`>]
  getState: () => T
}
