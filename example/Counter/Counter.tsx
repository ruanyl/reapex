import * as React from 'react'
import { render } from 'react-dom'
import { select } from 'redux-saga/effects'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import { App, renderApp, Registered } from '../../src'
import app from '../app'

app.model<{total: number}>({
  name: 'Counter',
  fields: {
    total: 0,
  },
  reducers: Counter => ({
    increase: Counter.total.increase,
    decrease: Counter.total.decrease,
  }),
  effects: ({ Counter }: any) => ({
    *increase() {
      const total = yield select(Counter.total.getter)
      console.log('total is: ', total)
    }
  })
})

const CounterComponent: React.SFC<{total: number, increase: Function, decrease: Function}> = props => {
  return (
    <>
      <button onClick={() => props.decrease()}>-</button>
      {props.total}
      <button onClick={() => props.increase()}>+</button>
    </>
  )
}

const CounterContainer = app.use(({ Counter }: any, { Counter: CounterActions }: any) => {
  const mapStateToProps = createStructuredSelector({
    total: Counter.total.getter,
  })

  const mapDispatchToProps = {
    increase: CounterActions.increase,
    decrease: CounterActions.decrease,
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(CounterComponent as any)
})

app.register('counter', CounterContainer)
