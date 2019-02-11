import * as React from 'react'
import { Map } from 'immutable'
import { Action, Reducer } from 'redux'
import { createState, LocalState } from 'immutable-state-creator'
import { createReducer, payloadReducer } from 'reducer-tools'

export type DeferredComponent<T = any> = () => React.ComponentType<T>

export interface Fields {
  mapping: Map<string, DeferredComponent>;
}

export interface RegistryPayload {
  name: string;
  component: () => React.ComponentType<any>;
}

export interface RegisterAction extends Action<string> {
  payload: RegistryPayload;
}

export const register = (name: string, component: DeferredComponent) => ({ type: '@@registry/register', payload: {name, component} })
export const registerAll = (mapping: Map<string, DeferredComponent>) => ({ type: '@@registry/registerAll', payload: mapping })

export const Registry = createState<Fields, keyof Fields>('@@registry', { mapping: Map() })

const registerReducer = (payload: RegistryPayload) => (s: LocalState<Fields>) => {
  const mapping = Registry.get('mapping')(s)
  return Registry.set('mapping', mapping.set(payload.name, payload.component))(s)
}

const registerAllReducer = (payload: Fields['mapping']) => (s: LocalState<Fields>) => {
  const mapping = Registry.get('mapping')(s)
  return Registry.set('mapping', mapping.concat(payload))(s)
}

export const registryReducer: Reducer = createReducer(Registry.create(), {
  '@@registry/register': payloadReducer(registerReducer),
  '@@registry/registerAll': payloadReducer(registerAllReducer),
})

export const registrySelector = (name: string) => (s: LocalState<Fields>) => {
  const mapping = Registry.get('mapping')(s)
  return mapping.get(name)
}
