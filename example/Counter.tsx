import React from 'react'
import { Record } from 'immutable'
import { select } from 'redux-saga/effects'

import app from './app'

const shape = { total: 0 }
const CounterState = Record(shape)
const initialState = new CounterState()

const counter = app.model('Counter', initialState)

export const [mutations, actionTypes] = counter.mutations({
  increase: () => (s) => {
    const total = s.total
    return s.set('total', total + 1)
  },
  decrease: () => (s) => {
    const total = s.total
    return s.set('total', total - 1)
  },
})

counter.effects({
  // by default is the current namespace, which is `Counter`
  *increase() {
    const total = yield select(counter.selectors.total)
    console.log('total is: ', total)
  },
  async decrease() {
    console.log('Wait 1.5s and then increase 1 automatically')
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(0)
      }, 1500)
    })
    mutations.increase()
    console.log('Increased 1')
  },
})

export const Counter = () => {
  const total = counter.useState((s) => s.total)
  return (
    <>
      <button onClick={mutations.decrease}>-</button>
      {total}
      <button onClick={mutations.increase}>+</button>
    </>
  )
}
