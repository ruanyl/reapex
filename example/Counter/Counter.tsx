import * as React from 'react'
import { render } from 'react-dom'
import { select } from 'redux-saga/effects'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Dictionary } from 'immutable-state-creator'

import { App, renderApp, Registered } from '../../src'
import app from '../app'

const DeferredCounter = app.use((states, actions) => {
  const mapStateToProps = createStructuredSelector({
    total: states.Counter.total.getter,
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

app.model<{total: number}>({
  name: 'Counter',
  fields: {
    total: 0,
  },
  mutations: Counter => ({
    increase: Counter.total.increase,
    decrease: Counter.total.decrease,
  }),
  effects: ({ Counter }) => ({
    // by default is the current namespace, which is `Counter`
    *increase() {
      const total = yield select(Counter.total.getter)
      console.log('total is: ', total)
    },
    // specify a namespace
    'Counter/decrease': function* decrease() {
      const total = yield select(Counter.total.getter)
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
