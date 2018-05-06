import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { App } from './app'

export const renderApp = (app: App, documentRoot: any) => {
  const store = app.createStore()
  render(
    <Provider store={store}>
      <app.Layout />
    </Provider>,
    documentRoot
  )
}
