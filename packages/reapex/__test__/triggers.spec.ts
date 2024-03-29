import { call } from 'redux-saga/effects'

import { App } from '../src/app'
import { delay } from './test.utils'

describe('create triggers', () => {
  let app: App

  beforeEach(() => {
    app = new App()
  })

  it('should run triggers', () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers] = model.triggers({
      setCurrentLanguage: (language: string) => {
        mutations.addLanguage(language)
      },
    })

    app.createStore()
    expect(model.getState().languages).toEqual([])

    triggers.setCurrentLanguage('Chinese')
    expect(model.getState().languages).toEqual(['Chinese'])

    triggers.setCurrentLanguage('English')
    expect(model.getState().languages).toEqual(['Chinese', 'English'])
  })

  it('should run triggers only ONE time on matter how many time `triggers()` function been called', () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers1] = model.triggers({
      setCurrentLanguage: (language: string) => {
        mutations.addLanguage(language)
      },
    })

    const [triggers2] = model.triggers({
      setCurrentLanguage: (language: string) => {
        mutations.addLanguage(language)
      },
    })

    app.createStore()
    expect(model.getState().languages).toEqual([])

    triggers1.setCurrentLanguage('Chinese')
    expect(model.getState().languages).toEqual(['Chinese'])

    triggers2.setCurrentLanguage('English')
    expect(model.getState().languages).toEqual(['Chinese', 'English'])
  })

  it('should run triggers only ONE time when `triggers()` been registered dynamically multiple times', () => {
    // Initialize the store at the beginning and register mutations & triggers dynamically
    app.createStore()
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers1] = model.triggers({
      setCurrentLanguage: (language: string) => {
        mutations.addLanguage(language)
      },
    })

    const [triggers2] = model.triggers({
      setCurrentLanguage: (language: string) => {
        mutations.addLanguage(language)
      },
    })

    expect(model.getState().languages).toEqual([])

    triggers1.setCurrentLanguage('Chinese')
    expect(model.getState().languages).toEqual(['Chinese'])

    triggers2.setCurrentLanguage('English')
    expect(model.getState().languages).toEqual(['Chinese', 'English'])
  })

  it('should run triggers with takeLeading', async () => {
    app.createStore()
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers] = model.triggers({
      setCurrentLanguage: {
        takeLeading: async (language: string) => {
          await delay(1000)
          mutations.addLanguage(language)
        },
      },
    })

    expect(model.getState().languages).toEqual([])

    triggers.setCurrentLanguage('English')
    triggers.setCurrentLanguage('Chinese')

    await delay(1000)
    expect(model.getState().languages).toEqual(['English'])
  })

  it('should run triggers with debounce', async () => {
    app.createStore()
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers] = model.triggers({
      setCurrentLanguage: {
        debounce: async (language: string) => {
          mutations.addLanguage(language)
        },
        ms: 1000,
      },
    })

    expect(model.getState().languages).toEqual([])

    triggers.setCurrentLanguage('English')
    await delay(100)
    triggers.setCurrentLanguage('Chinese')

    // The value is still empty right after the mutation
    expect(model.getState().languages).toEqual([])

    await delay(1000)
    expect(model.getState().languages).toEqual(['Chinese'])
  })

  it('should run triggers with throttle', async () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers] = model.triggers({
      setCurrentLanguage: {
        async throttle(language: string) {
          mutations.addLanguage(language)
        },
        ms: 1000,
      },
    })

    app.createStore()
    expect(model.getState().languages).toEqual([])

    triggers.setCurrentLanguage('English')

    await delay(100)

    triggers.setCurrentLanguage('Chinese')

    // The first value is set immediately
    expect(model.getState().languages).toEqual(['English'])

    await delay(1000)
    expect(model.getState().languages).toEqual(['English', 'Chinese'])
  })

  it('should run triggers with takeLatest', async () => {
    const initialState = { languages: [] as string[] }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    const [triggers] = model.triggers({
      setCurrentLanguage: {
        *takeLatest(language: string) {
          yield call(delay, 1000)
          mutations.addLanguage(language)
        },
      },
    })

    app.createStore()
    expect(model.getState().languages).toEqual([])

    triggers.setCurrentLanguage('English')
    triggers.setCurrentLanguage('Chinese')
    expect(model.getState().languages).toEqual([])

    await delay(1000)
    expect(model.getState().languages).toEqual(['Chinese'])
  })
})
