import { Model, Plugin } from 'reapex'

export const createLocalStoragePlugin = () => {
  const models: Record<string, Model<any, string>> = {}

  const plugin: Plugin = (hooks, app) => {
    hooks.afterMutationAsync.tap('LocalStoragePlugin', (state, namespace) => {
      if (models[namespace]) {
        const key = `${app.appConfig.name}/${namespace}`

        if (state === undefined) {
          localStorage.removeItem(key)
        }

        localStorage.setItem(key, JSON.stringify({ state }))
      }
    })

    hooks.beforeModelInitialized.tap(
      'LocalStoragePlugin',
      (initialState, namespace) => {
        if (models[namespace]) {
          const key = `${app.appConfig.name}/${namespace}`
          const item = localStorage.getItem(key)
          if (item !== null) {
            const { state } = JSON.parse(item)
            return state
          }
        }
        return initialState
      }
    )
  }

  const persist = <T, N extends string>(model: Model<T, N>) => {
    if (!models[model.namespace]) {
      models[model.namespace] = model
    }
    return model
  }

  const clear = <T, N extends string>(model: Model<T, N>) => {
    if (models[model.namespace]) {
      delete models[model.namespace]
    }
  }

  return { plugin, persist, clear }
}

export default createLocalStoragePlugin
