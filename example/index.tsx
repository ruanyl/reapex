import React from 'react'
import {BrowserRouter} from 'react-router-dom';
import { Route } from 'react-router-dom'
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import app from './app'
import { Counter } from './Counter/Counter'
import { Nav } from './Counter/Nav';

const store = app.createStore()

const Hello = React.lazy(() => import('./Counter/Hello'))

function WaitingComponent(Component: React.ComponentType<any>) {
  return (props: any) => (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component {...props} />
    </React.Suspense>
  );
}

render(
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Nav />
        <Counter />
        <Route path="/hello" component={WaitingComponent(Hello)} />
      </div>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
