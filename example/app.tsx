import * as React from 'react'

import { App, Registered, renderApp } from '../src'

const app = new App()

app.layout(() => (
  <div>
    <Registered name="counter" />
    <Registered name="hello" />
  </div>
))

export default app
