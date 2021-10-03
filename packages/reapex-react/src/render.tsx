import React from 'react'
import { render as reactDomRender } from 'react-dom'
import { Provider } from 'react-redux'
import { App } from 'reapex'

export const render = (Comp: React.ComponentType, app: App, target?: HTMLElement | null) => {
  const store = app.store ?? app.createStore()
  if (target) {
    reactDomRender(
      <Provider store={store}>
        <Comp />
      </Provider>,
      target
    )
  } else {
    return () => (
      <Provider store={store}>
        <Comp />
      </Provider>
    )
  }
}
