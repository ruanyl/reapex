import { call } from 'redux-saga/effects'

import { App } from '../src/app'
import { delay } from './test.utils'

describe('create effects', () => {
  let app: App

  beforeEach(() => {
    app = new App()
  })

  it('should run effects', () => {
    const initialState = { languages: Array<string>(), currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage(action: ReturnType<typeof mutations.setCurrentLanguage>) {
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

  it('should run effects only ONE time on matter how many time `effects()` function been called', () => {
    const initialState = { languages: Array<string>(), currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage(action: ReturnType<typeof mutations.setCurrentLanguage>) {
        const [language] = action.payload
        mutations.addLanguage(language)
      },
    })

    model.effects({
      setCurrentLanguage(action: ReturnType<typeof mutations.setCurrentLanguage>) {
        const [language] = action.payload
        mutations.addLanguage(language)
      },
    })

    // The store is initialized after mutations/effects
    const store = app.createStore()
    expect(model.selectors.currentLanguage(store.getState())).toEqual('')

    mutations.setCurrentLanguage('Chinese')
    expect(model.selectors.currentLanguage(store.getState())).toEqual('Chinese')
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })

  it('should run effects only ONE time when `efects()` been registered dynamically multiple times', () => {
    // Initialize the store at the beginning and register mutations & effects dynamically
    const store = app.createStore()
    const initialState = { languages: Array<string>(), currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage(action: ReturnType<typeof mutations.setCurrentLanguage>) {
        const [language] = action.payload
        mutations.addLanguage(language)
      },
    })

    model.effects({
      setCurrentLanguage(action: ReturnType<typeof mutations.setCurrentLanguage>) {
        const [language] = action.payload
        mutations.addLanguage(language)
      },
    })

    mutations.setCurrentLanguage('Chinese')
    expect(model.selectors.currentLanguage(store.getState())).toEqual('Chinese')
    // The effects should only been run once
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })

  it('should run effects with takeLeading', async () => {
    const initialState = { languages: [] as string[], currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage: {
        async takeLeading(action: ReturnType<typeof mutations.setCurrentLanguage>) {
          await delay(1000)
          const [language] = action.payload
          mutations.addLanguage(language)
        },
      },
    })

    const store = app.createStore()
    expect(model.selectors.currentLanguage(store.getState())).toEqual('')

    mutations.setCurrentLanguage('English')
    mutations.setCurrentLanguage('Chinese')

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['English'])
  })

  it('should run effects with debounce', async () => {
    const initialState = { languages: [] as string[], currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage: {
        async debounce(action: ReturnType<typeof mutations.setCurrentLanguage>) {
          const [language] = action.payload
          mutations.addLanguage(language)
        },
        ms: 1000,
      },
    })

    const store = app.createStore()
    expect(model.selectors.currentLanguage(store.getState())).toEqual('')

    mutations.setCurrentLanguage('English')
    await delay(100)
    mutations.setCurrentLanguage('Chinese')

    // The value is still empty right after the mutation
    expect(model.selectors.languages(store.getState())).toEqual([])

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })

  it('should run effects with throttle', async () => {
    const initialState = { languages: [] as string[], currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage: {
        async throttle(action: ReturnType<typeof mutations.setCurrentLanguage>) {
          const [language] = action.payload
          mutations.addLanguage(language)
        },
        ms: 1000,
      },
    })

    const store = app.createStore()
    expect(model.selectors.currentLanguage(store.getState())).toEqual('')

    mutations.setCurrentLanguage('English')
    await delay(100)
    mutations.setCurrentLanguage('Chinese')

    // The first value is set immediately
    expect(model.selectors.languages(store.getState())).toEqual(['English'])

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['English', 'Chinese'])
  })

  it('should run effects with takeLatest', async () => {
    const initialState = { languages: [] as string[], currentLanguage: '' }
    const model = app.model('User', initialState)

    const [mutations] = model.mutations({
      setCurrentLanguage: (language: string) => (s) => ({ ...s, currentLanguage: language }),
      addLanguage: (language: string) => (s) => ({ ...s, languages: s.languages.concat(language) }),
    })

    model.effects({
      setCurrentLanguage: {
        *takeLatest(action: ReturnType<typeof mutations.setCurrentLanguage>) {
          yield call(delay, 1000)
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

    await delay(1000)
    expect(model.selectors.languages(store.getState())).toEqual(['Chinese'])
  })
})
