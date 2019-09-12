import { createLogger } from 'redux-logger'
import { take } from 'redux-saga/effects'

import { App } from '../src'

function* globalWatcher() {
  while (true) {
    const action = yield take('Counter/increase')
    console.log('this is global watcher for Counter/increase', action)
  }
}

const logger = createLogger({
  stateTransformer: (state: any) => state.toJS(),
})

const app = new App({
  sagas: [globalWatcher],
  middlewares: [logger],
})

export default app
