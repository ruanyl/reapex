import * as React from 'react'
import app from '../app'

const Hello: React.SFC<{}> = () => <div>Hello World</div>

app.register('hello', () => Hello)
