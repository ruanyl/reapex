import * as React from 'react'
import {BrowserRouter} from 'react-router-dom';
import { Route } from 'react-router-dom'

import { App, Registered } from '../src'

const app = new App()

app.layout(() => (
  <BrowserRouter>
    <div>
      <Registered name="counter" />
      <Registered name="hello">
      { (Hello: any) => <Route path="/hello" component={Hello} /> }
      </Registered>
    </div>
  </BrowserRouter>
))

export default app
