import * as React from 'react'
import { apply } from 'ramda'
import { Map } from 'immutable'
import { Action } from 'redux'
import { createState, Dictionary, StateObject } from 'immutable-state-creator'
import { createReducer, transformReducer, payloadReducer } from 'reducer-tools'

interface Fields {
  mapping: Map<string, React.ComponentType<any>>;
}

interface RegistryPayload {
  name: string;
  component: React.ComponentType<any>;
}

export interface RegisterAction extends Action<string> {
  payload: RegistryPayload;
}

export const register = (name: string, component: React.ComponentType<any>) => ({ type: '@@registry/register', payload: {name, component} })
export const registerAll = (mapping: Map<string, React.ComponentType<any>>) => ({ type: '@@registry/registerAll', payload: mapping })

export const Registry = createState<Fields>({
  name: '@@registry',
  fields: {
    mapping: Map()
  }
})

export const registryReducer = createReducer(Registry.create(), {
  '@@registry/register': transformReducer((action: RegisterAction) => [action.payload.name, action.payload.component])(apply(Registry.mapping.set)),
  '@@registry/registerAll': payloadReducer(Registry.mapping.concat),
})
