import * as React from 'react'
import { select } from 'redux-saga/effects'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

// import { Registered } from '../../src'
import app from '../app'
import { Registered } from '../../src/Registered';

const counter = app.model('Counter', { total: 0 })

const mutations = counter.mutations(Counter => ({
  increase: (t: number) => s => {
    const total = Counter.get('total')(s)
    return Counter.set('total', total + t)(s)
  },
  decrease: () => s => {
    const total = Counter.get('total')(s)
    return Counter.set('total', total - 1)(s)
  },
}))

counter.effects<{Counter: typeof counter.state}>(({ Counter }) => ({
  // by default is the current namespace, which is `Counter`
  *increase() {
    const total = yield select(Counter.get('total'))
    console.log('total is: ', total)
  },
  // specify a namespace
  'Counter/decrease': function* decrease() {
    const total = yield select(Counter.get('total'))
    console.log('total is: ', total)
  }
}))

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
