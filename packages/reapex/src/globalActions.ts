import { SagaKind } from './types'

export const mutationsLoaded = (namespace: string) => ({
  type: '@@GLOBAL/MUTATIONS_LOADED',
  payload: [namespace],
})

export const sagaLoaded = (namespace: string, kind: SagaKind) => ({
  type: `@@GLOBAL/LOADED/${kind}/${namespace}`,
  payload: [namespace],
})

export const unloadSaga = (namespace: string, kind: SagaKind) => ({
  type: `@@GLOBAL/UNLOAD/${kind}/${namespace}`,
  payload: [namespace],
})
