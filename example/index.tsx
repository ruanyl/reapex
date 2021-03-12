import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import app from './app'
import { Counter } from './Counter'
import { UserInfo } from './UserInfo'

const Root = () => {
  return (
    <BrowserRouter>
      <div>
        <p>Counter example: </p>
        <Counter />
        <hr />
        <p>User Info form example:</p>
        <UserInfo />
      </div>
    </BrowserRouter>
  )
}

app.render(Root, document.getElementById('root'))
