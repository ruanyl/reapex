import './Counter/Nav'
import './Counter/Counter'
import './Counter/Hello'

import app from './app'
import { renderApp } from '../src'

renderApp(app, document.getElementById('root'))
