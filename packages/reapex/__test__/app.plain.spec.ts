import { App } from '../src/app'

describe('create actions', () => {
  let app: App
  const initialState = { total: 0 }

  beforeEach(() => {
    app = new App()
  })

  it('should create actions', () => {
    const model = app.model('Counter', initialState)
    const [mutations] = model.mutations({
      increase: () => (s) => ({ ...s, total: s.total + 1 }),
      decrease: () => (s) => ({ ...s, total: s.total - 1 }),
    })

    app.createStore()
    expect(model.getState().total).toEqual(0)

    expect(mutations.increase().type).toEqual('Counter/increase')
    expect(mutations.decrease().type).toEqual('Counter/decrease')
  })

  it('should create actionTypes', () => {
    const model = app.model('Counter', initialState)
    const [, actionTypes] = model.mutations({
      increase: () => (s) => ({ ...s, total: s.total + 1 }),
      decrease: () => (s) => ({ ...s, total: s.total - 1 }),
    })
    expect(actionTypes.increase).toEqual('Counter/increase')
    expect(actionTypes.decrease).toEqual('Counter/decrease')
  })

  it('should update state when dispatch actions', () => {
    const model = app.model('Counter', initialState)
    const [mutations] = model.mutations({
      increase: () => (s) => ({ ...s, total: s.total + 1 }),
      decrease: () => (s) => ({ ...s, total: s.total - 1 }),
    })

    app.createStore()
    expect(model.getState().total).toEqual(0)

    mutations.increase()
    expect(model.getState().total).toEqual(1)

    mutations.decrease()
    expect(model.getState().total).toEqual(0)
  })
})
