import { SagaIterator, Task } from 'redux-saga'
import {
  apply,
  call,
  cancel,
  debounce,
  fork,
  spawn,
  take,
  takeEvery,
  takeLatest,
  takeLeading,
  throttle,
} from 'redux-saga/effects'

import { Action, EffectMap, SagaKind, Trigger, TriggerNonGeneratorFunction } from './types'

const wrapper = (f: Trigger | TriggerNonGeneratorFunction) => {
  return function* (action: Action<any, any>) {
    yield apply(null, f, action.payload)
  }
}

export const createSaga = (modelSagas: EffectMap, namespace: string, kind: SagaKind) =>
  function* watcher(): SagaIterator {
    for (const actionType in modelSagas) {
      const sagaConfig = modelSagas[actionType]
      let task: Task
      if ('takeEvery' in sagaConfig) {
        task = yield takeEvery(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeEvery) : sagaConfig.takeEvery)
      } else if ('takeLatest' in sagaConfig) {
        task = yield takeLatest(actionType, sagaConfig.trigger ? wrapper(sagaConfig.takeLatest) : sagaConfig.takeLatest)
      } else if ('throttle' in sagaConfig) {
        task = yield throttle(
          sagaConfig.ms,
          actionType,
          sagaConfig.trigger ? wrapper(sagaConfig.throttle) : sagaConfig.throttle
        )
      } else if ('debounce' in sagaConfig) {
        task = yield debounce(
          sagaConfig.ms,
          actionType,
          sagaConfig.trigger ? wrapper(sagaConfig.debounce) : sagaConfig.debounce
        )
      } else if ('takeLeading' in sagaConfig) {
        task = yield takeLeading(
          actionType,
          sagaConfig.trigger ? wrapper(sagaConfig.takeLeading) : sagaConfig.takeLeading
        )
      } else {
        task = yield takeEvery(actionType, sagaConfig)
      }
      yield fork(function* () {
        yield take(`@@GLOBAL/UNLOAD/${kind}/${namespace}`)
        yield cancel(task)
      })
    }
  }

export function safeFork(saga: () => SagaIterator) {
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
