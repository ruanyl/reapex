import { App } from 'reapex'

import createLocalStoragePlugin from '../src/index'

const createApp = () => {
  const app = new App()
  app.createStore()

  const { plugin, persist, clear } = createLocalStoragePlugin()
  app.plugin(plugin)

  return [app, persist, clear] as const
}

describe('reapex local storage plugin', () => {
  it('should persist plain object state to localStorage', () => {
    const [app, persist] = createApp()

    const UserModel = app.model('user', { name: 'foo', age: 0 })
    persist(UserModel)

    const [mutations] = UserModel.mutations({
      setName: (name: string) => (user) => ({ ...user, name }),
      setAge: (age: number) => (user) => ({ ...user, age }),
    })

    mutations.setAge(12)
    mutations.setName('bar')

    const cache = localStorage.getItem('default/user')
    expect(cache).not.toBeNull()

    if (cache) {
      expect(JSON.parse(cache)).toEqual({ state: UserModel.getState() })
    }
  })

  it('should persist primitive type of state to localStorage', () => {
    const [app, persist] = createApp()

    const CounterModel = app.model('counter', 0)
    persist(CounterModel)

    const [mutations] = CounterModel.mutations({
      increase: () => (counter) => counter + 1,
    })

    mutations.increase()

    const cache = localStorage.getItem('default/counter')
    expect(cache).not.toBeNull()

    if (cache) {
      expect(JSON.parse(cache)).toEqual({ state: 1 })
    }
  })

  it('should restore state from localStorage', () => {
    {
      const [app, persist] = createApp()
      localStorage.setItem('default/counter', JSON.stringify({ state: 100 }))

      const CounterModel = app.model('counter', 0)
      persist(CounterModel)

      CounterModel.mutations({
        increase: () => (counter) => counter + 1,
      })

      expect(CounterModel.getState()).toEqual(100)
    }
    {
      const [app, persist] = createApp()
      localStorage.setItem(
        'default/user',
        JSON.stringify({ state: { name: 'foobar', age: 100 } })
      )

      const UserModel = app.model('user', { name: 'foo', age: 0 })
      persist(UserModel)

      UserModel.mutations({
        setName: (name: string) => (user) => ({ ...user, name }),
        setAge: (age: number) => (user) => ({ ...user, age }),
      })

      expect(UserModel.getState()).toEqual({ name: 'foobar', age: 100 })
    }
  })
})
