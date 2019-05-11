import React from 'react'
import { Map } from 'immutable'
import { Action, Reducer } from 'redux'
import { createState, LocalState } from 'immutable-state-creator'
import { createReducer } from 'reducer-tools'

export interface Fields {
  mapping: Map<string, React.ComponentType<any>>;
}

export interface RegistryPayload {
  name: string;
  component: React.ComponentType<any>;
}

export interface RegisterAction extends Action<string> {
  payload: RegistryPayload;
}

export const register = (name: string, component: React.ComponentType<any>) => ({ type: '@@registry/register', payload: {name, component} })

export const Registry = createState<Fields>('@@registry', { mapping: Map() })

const registerReducer = (payload: RegistryPayload) => (s: LocalState<Fields>) => {
  const mapping = Registry.get('mapping')(s)
  return Registry.set('mapping', mapping.set(payload.name, payload.component))(s)
}

export const registryReducer: Reducer = createReducer(Registry.create(), {
  '@@registry/register': (s: any, a: any) => registerReducer(a.payload)(s),
})

export const registrySelector = (name: string) => (s: LocalState<Fields>) => {
  const mapping = Registry.get('mapping')(s)
  return mapping.get(name)
}
