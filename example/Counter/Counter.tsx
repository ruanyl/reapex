import * as React from 'react'
import { select, take } from 'redux-saga/effects'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

// import { Registered } from '../../src'
import app from '../app'
import { Registered } from '../../src/Registered';

const counter = app.model('Counter', { total: 0 })

const mutations = counter.mutations({
  increase: (t: number) => s => {
    const total = counter.state.get('total')(s)
    return counter.state.set('total', total + t)(s)
  },
  decrease: () => s => {
    const total = counter.state.get('total')(s)
    return counter.state.set('total', total - 1)(s)
  },
})

counter.effects({
  // by default is the current namespace, which is `Counter`
  *increase() {
    const total = yield select(counter.state.get('total'))
    console.log('total is: ', total)
  },

  // specify a namespace
  'decrease': [function* decrease(action: ReturnType<typeof mutations.decrease>) {
    console.log(action.type)
    const total = yield select(counter.state.get('total'))
    console.log('total is: ', total)
  }, { type: 'takeEvery', namespace: 'Counter' }],

  'thisIsWatcher': [function* watch() {
    while (true) {
      yield take('Counter/increase')
      console.log('xxxxxxx')
    }
  }, { type: 'watcher' }]
})

const mapStateToProps = createStructuredSelector({
  total: counter.state.get('total'),
})

const mapDispatchToProps = {
  increase: mutations.increase,
  decrease: mutations.decrease,
}

type CounterComponentProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>

const CounterComponent: React.SFC<CounterComponentProps> = props => {
  return (
    <>
      <Registered name="nav" lazy={() => import('./Nav')} />
      <button onClick={() => props.decrease()}>-</button>
      {props.total}
      <button onClick={() => props.increase(1)}>+</button>
    </>
  )
}

app.register('counter', connect(mapStateToProps, mapDispatchToProps)(CounterComponent))
