import * as React from 'react'
import {BrowserRouter} from 'react-router-dom';
import { Route } from 'react-router-dom'
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import app from './app'
import { Registered } from '../src'

const store = app.createStore()

render(
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Registered name="counter" lazy={() => import('./Counter/Counter')} />
        <Route path="/hello" component={() => <Registered name="hello" lazy={() => import('./Counter/Hello')} />} />
      </div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
