import * as React from 'react'
import { apply } from 'ramda'
import { Map } from 'immutable'
import { Action, Reducer } from 'redux'
import { createState, StateObject } from 'immutable-state-creator'
import { createReducer, transformReducer, payloadReducer } from 'reducer-tools'

export type DeferredComponent<T = any> = () => React.ComponentType<T>

export interface Fields {
  mapping: Map<string, DeferredComponent>;
}

export interface RegistryPayload {
  name: string;
  component: React.ComponentType<any>;
}

export interface RegisterAction extends Action<string> {
  payload: RegistryPayload;
}

export const register = (name: string, component: DeferredComponent) => ({ type: '@@registry/register', payload: {name, component} })
export const registerAll = (mapping: Map<string, DeferredComponent>) => ({ type: '@@registry/registerAll', payload: mapping })

export const Registry: StateObject<Fields> = createState<Fields>({
  name: '@@registry',
  fields: {
    mapping: Map()
  }
})

export const registryReducer: Reducer = createReducer(Registry.create(), {
  '@@registry/register': transformReducer((action: RegisterAction) => [action.payload.name, action.payload.component])(apply(Registry.mapping.set)),
  '@@registry/registerAll': payloadReducer(Registry.mapping.concat),
})
