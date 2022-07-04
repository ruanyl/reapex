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

    expect(model.getState().languages).toEqual([])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.getState().languages).toEqual(['Chinese'])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    expect(model.getState().languages).toEqual(['Chinese', 'English'])
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

    expect(model.getState().languages).toEqual([])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.getState().languages).toEqual(['Chinese'])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    expect(model.getState().languages).toEqual(['Chinese', 'English'])
  })

  it('should run subscriptions only ONE time when `subscriptions()` been registered dynamically multiple times', () => {
    // Initialize the store at the beginning and register mutations & subscriptions dynamically
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

    expect(model.getState().languages).toEqual([])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.getState().languages).toEqual(['Chinese'])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    expect(model.getState().languages).toEqual(['Chinese', 'English'])
  })

  it('should run subscriptions with takeLeading', async () => {
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

    expect(model.getState().languages).toEqual([])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })

    await delay(1000)
    expect(model.getState().languages).toEqual(['English'])
  })

  it('should run subscriptions with debounce', async () => {
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

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })

    await delay(100)

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })

    // The value is still empty right after the mutation
    expect(model.getState().languages).toEqual([])

    await delay(1000)
    expect(model.getState().languages).toEqual(['Chinese'])
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

    expect(model.getState().languages).toEqual([])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })

    await delay(100)

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })

    // The first value is set immediately
    expect(model.getState().languages).toEqual(['English'])

    await delay(1000)
    expect(model.getState().languages).toEqual(['English', 'Chinese'])
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

    expect(model.getState().languages).toEqual([])

    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'English',
    })
    app.dispatch({
      type: 'ActionType.External.SetCurrentLanguage',
      value: 'Chinese',
    })
    expect(model.getState().languages).toEqual([])

    await delay(1000)
    expect(model.getState().languages).toEqual(['Chinese'])
  })
})
