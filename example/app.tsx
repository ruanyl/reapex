import { App } from '../src'
import { take } from 'redux-saga/effects';

function* globalWatcher() {
  while (true) {
    const action = yield take('Counter/increase')
    console.log('this is global watcher for Counter/increase', action)
  }
}

const app = new App({
  mode: 'development',
  externalEffects: [globalWatcher]
})

export default app
