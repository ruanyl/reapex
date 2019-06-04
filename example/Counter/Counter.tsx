import * as React from 'react'
import { select, take } from 'redux-saga/effects'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import app from '../app'

const counter = app.model('Counter', { total: 0 })

const [mutations, actionTypes] = counter.mutations({
  increase: (t: number) => s => {
    const total = s.total
    return s.set('total', total + t)
  },
  decrease: () => s => {
    const total = s.total
    return s.set('total', total - 1)
  },
}, {
  'Nav/push': (item: string) => s => {
    return s.set('total', 10000)
  }
})

console.log(actionTypes);

const [effects, effectsActionTypes] = counter.effects({
  // by default is the current namespace, which is `Counter`
  *increase() {
    const total = yield select(counter.state.get('total'))
    console.log('total is: ', total)
  },

  // specify a namespace
  'Counter/decrease': {
    *takeEvery(action: ReturnType<typeof mutations.decrease>) {
      console.log(action.type)
      const total = yield select(counter.state.get('total'))
      console.log('total is: ', total)
    },
  },

  'thisIsWatcher': {
    *watcher() {
      while (true) {
        yield take('Counter/increase')
        console.log('xxxxxxx')
      }
    },
  }
}, {
  'triggerAction': {
    *takeEvery(n: number) {
      const total = yield select(counter.state.get('total'))
      console.log('triggerAction, total + N: ', total + n)
    }
  }
})

console.log(effectsActionTypes)

const mapStateToProps = createStructuredSelector({
  total: counter.state.get('total'),
})

const mapDispatchToProps = {
  increase: mutations.increase,
  decrease: mutations.decrease,
  logger: effects.triggerAction,
}

type CounterComponentProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>

const CounterComponent: React.SFC<CounterComponentProps> = props => {
  return (
    <>
      <button onClick={() => props.decrease()}>-</button>
      {props.total}
      <button onClick={() => props.increase(1)}>+</button>
      <button onClick={() => props.logger(100)}>+100</button>
    </>
  )
}

export const Counter = connect(mapStateToProps, mapDispatchToProps)(CounterComponent)
