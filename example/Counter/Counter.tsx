import * as React from 'react'
import { StateObject, LocalState } from 'immutable-state-creator'
import { select } from 'redux-saga/effects'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import { Registered } from '../../src'
import app from '../app'

const DeferredCounter = app.use((states, actions) => {
  const mapStateToProps = createStructuredSelector({
    total: states.Counter.get('total'),
  })

  const mapDispatchToProps = {
    increase: actions.Counter.increase,
    decrease: actions.Counter.decrease,
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(CounterComponent as any)
})

interface Fields {
  total: number
}

app.model<Fields>({
  name: 'Counter',
  fields: {
    total: 0,
  },
  mutations: Counter => ({
    increase: s => {
      const total = Counter.get('total')(s)
      return Counter.set('total', total + 1)(s)
    },
    decrease: s => {
      const total = Counter.get('total')(s)
      return Counter.set('total', total - 1)(s)
    },
  }),
  effects: ({ Counter }: {Counter: StateObject<Fields, keyof Fields>}) => ({
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
  })
})

const CounterComponent: React.SFC<{total: number, increase: Function, decrease: Function}> = props => {
  return (
    <>
      <Registered name="nav" />
      <button onClick={() => props.decrease()}>-</button>
      {props.total}
      <button onClick={() => props.increase()}>+</button>
    </>
  )
}

app.register('counter', DeferredCounter)
