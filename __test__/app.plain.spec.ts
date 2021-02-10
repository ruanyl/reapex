import { delay } from 'redux-saga/effects'

import { App } from '../src/app'

interface ValueAction<T = any> {
  type: string
  value: T
}

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

    const store = app.createStore()
    expect(model.selectors.total(store.getState())).toEqual(0)

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

    const store = app.createStore()
    expect(model.selectors.total(store.getState())).toEqual(0)

    mutations.increase()
    expect(model.selectors.total(store.getState())).toEqual(1)

    mutations.decrease()
    expect(model.selectors.total(store.getState())).toEqual(0)
  })

  it('Model can subscribe to action types of other namespace', () => {
    const model = app.model('test', initialState)
    model.mutations(
      {
        increase: () => (s) => ({ ...s, total: s.total + 1 }),
        decrease: () => (s) => ({ ...s, total: s.total - 1 }),
      },
      {
        'OtherNamespace/actionType': () => (s) => ({ ...s, total: 100 }),
      }
    )

    const store = app.createStore()
    expect(model.selectors.total(store.getState())).toEqual(0)

    store.dispatch({ type: 'OtherNamespace/actionType' })
    expect(model.selectors.total(store.getState())).toEqual(100)
  })
})

describe('create sagas', () => {
  let app: App

  beforeEach(() => {
    app = new App({
      actionTypeHasNamespace: (actionType: string) => actionType.includes('.'),
    })
  })

  it('should run sagas by default with takeEvery effect', () => {
    interface State {
      languages: string[]
      currentLanguage: string
    }
    const initialState: State = { languages: [], currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      *setCurrentLanguage(action: ReturnType<typeof mutations.setCurrentLanguage>) {
        const [language] = action.payload
        mutations.addLanguage(language)
      },
    })

    const store = app.createStore()
    expect(model.selectors.currentLanguage(store.getState())).toEqual('')

    mutations.setCurrentLanguage('English')
    mutations.setCurrentLanguage('Chinese')
    expect(model.selectors.currentLanguage(store.getState())).toEqual('Chinese')
    expect(model.selectors.languages(store.getState())).toEqual(['English', 'Chinese'])
  })

  it('should run sagas with takeLatest effect', () => {
    interface State {
      languages: string[]
      currentLanguage: string
    }
    const initialState: State = { languages: [], currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage: {
        *takeLatest(action: ReturnType<typeof mutations.setCurrentLanguage>) {
          yield delay(1000)
          const [language] = action.payload
          mutations.addLanguage(language)
        },
      },
    })

    const store = app.createStore()
    expect(model.selectors.currentLanguage(store.getState())).toEqual('')

    mutations.setCurrentLanguage('English')
    mutations.setCurrentLanguage('Chinese')
    expect(model.selectors.currentLanguage(store.getState())).toEqual('Chinese')

    return new Promise((resolver) => {
      setTimeout(() => {
        expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
        resolver()
      }, 1500)
    })
  })

  it('should run saga by watching an external actions', () => {
    interface State {
      languages: string[]
    }
    const initialState: State = { languages: [] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      'ActionType.External.SetCurrentLanguage': function* setCurrentLanguage(action: ValueAction<string>) {
        const language = action.value
        mutations.addLanguage(language)
      },
    })

    const store = app.createStore()
    expect(model.selectors.languages(store.getState())).toEqual([])

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })

  it('should create effects only actions', () => {
    interface State {
      languages: string[]
    }
    const initialState: State = { languages: [] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers] = model.triggers({
      setCurrentLanguage: {
        *takeEvery(language: string) {
          mutations.addLanguage(language)
        },
      },
    })

    const store = app.createStore()
    expect(model.selectors.languages(store.getState())).toEqual([])

    triggers.setCurrentLanguage('English')
    triggers.setCurrentLanguage('Chinese')
    expect(model.selectors.languages(store.getState())).toEqual(['English', 'Chinese'])
  })
})
