import { Record as ImmutableRecord } from 'immutable'

import { App } from '../src/app'

describe('create actions', () => {
  let app: App
  const CounterState = ImmutableRecord({ total: 0 })
  const initialState = new CounterState()

  beforeEach(() => {
    app = new App()
  })

  it('should create actions', () => {
    const model = app.model('Counter', initialState)
    const [mutations] = model.mutations({
      increase: () => (s) => s.set('total', s.total + 1),
      decrease: () => (s) => s.set('total', s.total - 1),
    })

    const store = app.createStore()
    expect(model.selectors.total(store.getState())).toEqual(0)

    expect(mutations.increase().type).toEqual('Counter/increase')
    expect(mutations.decrease().type).toEqual('Counter/decrease')
  })

  it('should create actionTypes', () => {
    const model = app.model('Counter', initialState)
    const [, actionTypes] = model.mutations({
      increase: () => (s) => s.set('total', s.total + 1),
      decrease: () => (s) => s.set('total', s.total - 1),
    })
    expect(actionTypes.increase).toEqual('Counter/increase')
    expect(actionTypes.decrease).toEqual('Counter/decrease')
  })

  it('should update state when dispatch actions', () => {
    const model = app.model('Counter', initialState)
    const [mutations] = model.mutations({
      increase: () => (s) => s.set('total', s.total + 1),
      decrease: () => (s) => s.set('total', s.total - 1),
    })

    const store = app.createStore()
    expect(model.selectors.total(store.getState())).toEqual(0)

    mutations.increase()
    expect(model.selectors.total(store.getState())).toEqual(1)

    mutations.decrease()
    expect(model.selectors.total(store.getState())).toEqual(0)
  })
})
