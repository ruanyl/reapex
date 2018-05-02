import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

export const renderApp = (app: any, router: any, documentRoot: any) => {
  const store = app.createStore()
  render(
    <Provider store={store}>
      { router }
    </Provider>,
    documentRoot
  )
}
