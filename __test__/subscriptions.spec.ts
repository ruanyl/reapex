import { call } from 'redux-saga/effects'

import { App } from '../src/app'
import { delay } from './test.utils'

interface ValueAction<T = any> {
  type: string
  value: T
}

describe('create subscriptions', () => {
  let app: App

  beforeEach(() => {
    app = new App()
  })

  it('should run subscriptions', () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': function setCurrentLanguage(action: ValueAction<string>) {
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

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese', 'English'])
  })

  it('should run subscriptions only ONE time on matter how many time `subscriptions()` function been called', () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': function setCurrentLanguage(action: ValueAction<string>) {
        const language = action.value
        mutations.addLanguage(language)
      },
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': function setCurrentLanguage(action: ValueAction<string>) {
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

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese', 'English'])
  })

  it('should run subscriptions only ONE time when `subscriptions()` been registered dynamically multiple times', () => {
    // Initialize the store at the beginning and register mutations & subscriptions dynamically
    const store = app.createStore()
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': function setCurrentLanguage(action: ValueAction<string>) {
        const language = action.value
        mutations.addLanguage(language)
      },
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': function setCurrentLanguage(action: ValueAction<string>) {
        const language = action.value
        mutations.addLanguage(language)
      },
    })

    expect(model.selectors.languages(store.getState())).toEqual([])

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese', 'English'])
  })

  it('should run subscriptions with takeLeading', async () => {
    const store = app.createStore()
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': {
        takeLeading: async function (action: ValueAction<string>) {
          const language = action.value
          await delay(1000)
          mutations.addLanguage(language)
        },
      },
    })

    expect(model.selectors.languages(store.getState())).toEqual([])

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['English'])
  })

  it('should run subscriptions with debounce', async () => {
    const store = app.createStore()
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': {
        async debounce(action: ValueAction<string>) {
          const language = action.value
          mutations.addLanguage(language)
        },
        ms: 1000,
      },
    })

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })

    await delay(100)

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })

    // The value is still empty right after the mutation
    expect(model.selectors.languages(store.getState())).toEqual([])

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })

  it('should run subscriptions with throttle', async () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': {
        async throttle(action: ValueAction<string>) {
          const language = action.value
          mutations.addLanguage(language)
        },
        ms: 1000,
      },
    })

    const store = app.createStore()
    expect(model.selectors.languages(store.getState())).toEqual([])

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })

    await delay(100)

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })

    // The first value is set immediately
    expect(model.selectors.languages(store.getState())).toEqual(['English'])

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['English', 'Chinese'])
  })

  it('should run subscriptions with takeLatest', async () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.subscriptions({
      'ActionType.External.SetCurrentLanguage': {
        *takeLatest(action: ValueAction<string>) {
          yield call(delay, 1000)
          const language = action.value
          mutations.addLanguage(language)
        },
      },
    })

    const store = app.createStore()
    expect(model.selectors.languages(store.getState())).toEqual([])

    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    store.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.selectors.languages(store.getState())).toEqual([])

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })
})
