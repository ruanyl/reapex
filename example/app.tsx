import { createLogger } from 'redux-logger'
import { take } from 'redux-saga/effects'

import { App } from '../lib'

function* globalWatcher(): Iterator<any> {
  while (true) {
    const action = yield take('Counter/increase')
    console.log('this is global watcher for Counter/increase', action)
  }
}

const logger = createLogger()

const app = new App({
  middlewares: [logger],
})

app.runSaga(globalWatcher)

export default app
