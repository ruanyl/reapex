## Reapex

Reapex is a lightweight "framework" written in TypeScript to build pluggable and extendable redux(react) application

Reapex is designed in a way that modules have a clear boundary with each other, it forces people to think in a modularized way when working with Reapex. 

Reapex supports plugins which make it easy to share reusable modules among projects. Or even publishing to npm. Such as [reapex-plugin-dataloader](https://github.com/ReapexJS/reapex-plugin-dataloader)


#### Built with the love of TypeScript
> Reapex is written with TypeScript and it offers strongly typed state, selectors, actions.

## Features
- [x] Reapex will automatically create actions/action types, much less boilerplate which makes app easy to maintain and refactor
- [x] Reapex loads modules dynamically, sagas/reducers are registered dynamically which makes code-splitting easy
- [x] Plugin support, create reusable and shareable code easily
- [x] Lightweight, easy to integrate with existing react/redux/redux-sagas application

## Examples

1. [Counter](https://codesandbox.io/s/reapex-example-counter-9pyy6): A legendary Counter example
2. [Login Form](https://codesandbox.io/s/reapex-login-form-7f3m6): Side effects handling with the demo of API call

## Getting started with a simple `Counter` example

```
npm i reapex --save
```
#### Install peer dependencies
```
npm i react react-dom redux react-redux redux-saga --save
```

### 1. Initialize the application
```typescript
import { App } from 'reapex'

const app = new App()

```

### 2. Create a model(the shape of the state)
```typescript
const counter = app.model('Counter', { total: 0 })
```

### 3. Defined the mutations: how you want the state to be mutated
Mutation combines action types and reducer, and it returns action creators

```typescript
const [mutations] = counter.mutations({
  increase: (t: number) => s => s.set('total', s.total + t),
  decrease: () => s => s.set('total', s.total - 1),
})
```
The function: `(t: number) => s => s.set('total', s.total + t)`, `t: number` will be the input parameter of the action creator. `s` is a typed immutable `Record<{total: number}>`. By running the code above you will get an action creator map as:
```
{
  increase: (t: number) => ({ type: 'Counter/increase',  payload: [t] })
  decrease: () => ({ type: 'Counter/decrease' })
}
```

### 4. Connect it with Component
`react-reudx` users should be very familiar with the following codes, it is a typical react-redux container, but with action creators and selectors which automatically created by `reapex`.

```typescript
import React from 'react'
import { useSelector, useDispatch, Provider } from 'react-redux'

export const Counter = () => {
  const total = useSelector(CounterModel.selectors.total)
  const dispatch = useDispatch()
  
  return (
    <>
      <button onClick={() => dispatch(mutations.decrease())}>-</button>
      {props.total}
      <button onClick={() => dispatch(mutations.increase(2))}>+2</button>
    </>
  )
}
```
Note: `counter.state.get('total')` provides the selector to the `total`

### 5. Render it!
```typescript
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

const store = app.createStore()

render(
  <Provider store={store}>
    <Counter />
  </Provider>,
  document.getElementById('root')
)
```
