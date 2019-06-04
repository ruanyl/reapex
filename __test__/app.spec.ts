import { App } from '../src/app'

describe('createActions', () => {
  let app: App

  beforeEach(() => {
    app = new App()
  });

  it('should create model', () => {
    const model = app.model('test', {total: 0})
    const [mutations] = model.mutations({
      increase: () => s => s.set('total', s.total + 1),
      decrease: () => s => s.set('total', s.total - 1),
    })
    const store = app.createStore()

    expect(store.getState().get('test', {}).toJS()).toEqual({total: 0})

    store.dispatch(mutations.increase())
    expect(store.getState().get('test', {}).toJS()).toEqual({total: 1})

    store.dispatch(mutations.decrease())
    expect(store.getState().get('test', {}).toJS()).toEqual({total: 0})
  });

  it('should generate actionTypes', () => {
    const model = app.model('test', {total: 0})
    const [, actionTypes] = model.mutations({
      increase: () => s => s.set('total', s.total + 1),
      decrease: () => s => s.set('total', s.total - 1),
    })
    expect(actionTypes.increase).toEqual('test/increase')
    expect(actionTypes.decrease).toEqual('test/decrease')
  });
});

