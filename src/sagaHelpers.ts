import { SagaIterator } from 'redux-saga'
import { all, apply, call, debounce, spawn, takeEvery, takeLatest, takeLeading, throttle } from 'redux-saga/effects'

import { Action, EffectMap, Saga } from './types'

const wrapper = (f: Saga) => {
  return function* (action: Action<any, any>) {
    yield apply(null, f, action.payload)
  }
}

export const createSaga = (modelSagas: EffectMap) =>
  function* watcher(): SagaIterator {
    yield all(
      Object.keys(modelSagas).map((actionType) => {
        const sagaConfig = modelSagas[actionType]
        if ('takeEvery' in sagaConfig) {
          return takeEvery(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeEvery) : sagaConfig.takeEvery)
        } else if ('takeLatest' in sagaConfig) {
          return takeLatest(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeLatest) : sagaConfig.takeLatest)
        } else if ('throttle' in sagaConfig) {
          return throttle(
            sagaConfig.ms,
            actionType,
            sagaConfig.trigger ? wrapper(sagaConfig.throttle) : sagaConfig.throttle
          )
        } else if ('debounce' in sagaConfig) {
          return debounce(
            sagaConfig.ms,
            actionType,
            sagaConfig.trigger ? wrapper(sagaConfig.debounce) : sagaConfig.debounce
          )
        } else if ('takeLeading' in sagaConfig) {
          return takeLeading(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeLeading) : sagaConfig.takeLeading)
        } else {
          return takeEvery(actionType, sagaConfig)
        }
      })
    )
  }

export function safeFork(saga: () => SagaIterator<any>) {
  return spawn(function* () {
    while (true) {
      try {
        yield call(saga)
        break
      } catch (e) {
        console.error(e)
      }
    }
  })
}
