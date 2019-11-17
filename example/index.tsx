import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import app from './app'
import { Counter } from './Counter'
import { UserInfo } from './UserInfo'

const store = app.createStore()

render(
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <p>Counter example: </p>
        <Counter />
        <hr />
        <p>User Info form example:</p>
        <UserInfo />
      </div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
