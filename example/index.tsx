import * as React from 'react'
import {BrowserRouter} from 'react-router-dom';
import { Route } from 'react-router-dom'

import app from './app'
import { renderApp, Registered } from '../src'

app.layout(() => (
  <BrowserRouter>
    <div>
      <Registered name="counter" lazy={() => import(/* webpackChunkName: "counter" */ './Counter/Counter')} />
      <Route path="/hello" component={() => <Registered name="hello" lazy={() => import(/* webpackChunkName: "hello" */ './Counter/Hello')} />} />
    </div>
  </BrowserRouter>
))

renderApp(app, document.getElementById('root'))
