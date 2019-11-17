import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { select } from 'redux-saga/effects'

import app from './app'

const counter = app.model('Counter', { total: 0 })

export const [mutations, actionTypes] = counter.mutations({
  increase: () => s => {
    const total = s.total
    return s.set('total', total + 1)
  },
  decrease: () => s => {
    const total = s.total
    return s.set('total', total - 1)
  },
})

export const [effects] = counter.effects({
  // by default is the current namespace, which is `Counter`
  *increase() {
    const total = yield select(counter.selectors.total)
    console.log('total is: ', total)
  },
})

export const Counter: React.SFC = () => {
  const total = useSelector(counter.selectors.total)
  const dispatch = useDispatch()
  return (
    <>
      <button onClick={() => dispatch(mutations.decrease())}>-</button>
      {total}
      <button onClick={() => dispatch(mutations.increase())}>+</button>
    </>
  )
}
