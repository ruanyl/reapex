import React from 'react'
import { Record } from 'immutable'
import { useSelector } from 'react-redux'
import { select } from 'redux-saga/effects'

import app from './app'

const shape = { total: 0 }
const CounterState = Record(shape)
const initialState = new CounterState()

const counter = app.model('Counter', initialState)

export const [mutations, actionTypes] = counter.mutations(
  {
    increase: (n: number) => (s) => {
      const total = s.total
      return s.set('total', total + 1)
    },
    decrease: () => (s) => {
      const total = s.total
      return s.set('total', total - 1)
    },
  },
  {
    test: (a: MyAction) => (s) => s,
  }
)

type MyAction = {
  type: string
  value: number
}

counter.effects({
  // by default is the current namespace, which is `Counter`
  *increase() {
    const total = yield select(counter.selectors.total)
    console.log('total is: ', total)
  },
  myaction: {
    *takeEvery(action: MyAction) {},
  },
})

export const Counter: React.SFC = () => {
  const total = useSelector(counter.selectors.total)
  return (
    <>
      <button onClick={() => mutations.decrease()}>-</button>
      {total}
      <button onClick={() => mutations.increase(1)}>+</button>
    </>
  )
}
