import { select } from 'redux-saga/effects'

import { App } from '../src/app'

describe('createActions', function() {
  let app: App
  const onIncrease = jest.fn()
  const onDecrease = jest.fn()

  beforeEach(function() {
    app = new App()
    app.model<{total: number}>({
      name: 'Counter',
      fields: {
        total: 0,
      },
      mutations: Counter => ({
        increase: Counter.total.increase,
        decrease: Counter.total.decrease,
      }),
      effects: ({ Counter }: any) => ({
        // by default is the current namespace, which is `Counter`
        *increase() {
          const total = yield select(Counter.total.getter)
          onIncrease(total)
        },
        // specify a namespace
        'Counter/decrease': function* decrease() {
          const total = yield select(Counter.total.getter)
          onDecrease(total)
        }
      })
    })
  });

  it('should have action creators', function() {
    expect(app.actionCreators.Counter.increase()).toEqual({ type: 'Counter/increase' })
    expect(app.actionCreators.Counter.decrease()).toEqual({ type: 'Counter/decrease' })
  });

  it('should create a store', function() {
    const store = app.createStore()
    expect(store.getState().get('Counter').toJS()).toEqual({ total: 0 })
  });

  it('should update store', function() {
    const store = app.createStore()
    store.dispatch(app.actionCreators.Counter.increase())
    expect(store.getState().get('Counter').toJS()).toEqual({ total: 1 })
    expect(onIncrease).toHaveBeenCalledWith(1)

    store.dispatch(app.actionCreators.Counter.decrease())
    expect(store.getState().get('Counter').toJS()).toEqual({ total: 0 })
    expect(onDecrease).toHaveBeenCalledWith(0)
  });
});

