import { render } from 'react-dom'
import { Provider } from 'react-redux'

export const renderApp = (store, router, documentRoot) => {
  render(
    <Provider store={store}>
      { router }
    </Provider>,
    documentRoot
  )
}
