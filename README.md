## Reapex

Reapex is a lightweight "framework" written in TypeScript to build pluggable and extendable redux(react) application. It greatly reduced the boilerpates of a regular redux based application.

Reapex is designed in a way that modules have a clear boundary with each other. It provides strong-typed everything out of the box.

You can use reapex to create shareable modules easily. And share the modules among projects or publishing to npm and share with the public. Such as [reapex-plugin-dataloader](https://github.com/ReapexJS/reapex-plugin-dataloader)


#### Built with the love of TypeScript
> Reapex is written with TypeScript and it provides strong-typed state, selectors, actions.

## Examples

1. [Counter](https://codesandbox.io/s/reapex-example-counter-oluew): A simple Counter example
2. [Login Form](https://codesandbox.io/s/reapex-login-form-06eq1): Side effects handling with the demo of API call

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
const CounterModel = app.model('Counter', { total: 0 })
```

### 3. Defined the mutations: how you want the state to be mutated
```typescript
const [mutations] = counter.mutations({
  increase: () => s => ({...s, total: s.total + 1}),
  decrease: () => s => ({...s, total: s.total - 1}),
})
```

### 4. Connect it with Component
`react-redux` users should be very familiar with the following codes, it is a typical react-redux container, but with action creators and selectors which provided by `reapex`.

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
      <button onClick={() => dispatch(mutations.increase())}>+</button>
    </>
  )
}
```

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
