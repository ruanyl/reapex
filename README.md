## Reapex

Reapex is a lightweight "framework" written in TypeScript to build pluggable and extendable redux(react) application

Reapex is created to serve the following purpose:

#### Get rid of Redux boilerplate.

> Action Types are just string constants, and Action Creators are "function constants". One can derive Action Type and Action Creator from a reducer function. Why would I have to create them manually? 

> Reapex simplified the creation of Action Type/Action Creator/Reducer and combined them to one concept which is called "Mutation". It lets you focus on writing the code logic, not copy/paste boilerplates.

#### Modularization and ready for code splitting and dynamic loading.

> Reapex is designed in a way that modules have a clear boundary with each other, it forces people to think in a modularized way when working with Reapex. 

> Reapex support plugin which makes it easy to share reusable modules, for example, publish to npm. Such as [reapex-plugin-modal](https://github.com/ReapexJS/reapex-plugin-modal)


#### Built with the love of TypeScript
> Reapex is written with TypeScript which means you get strong typed state, selectors, actions.

## Features
- [x] Reapex will automatically create actions/action types, much less boilerplate which makes app easy to maintain and less refactoring costs
- [x] Reapex loads modules dynamically(code-split), sagas/reducers are registered automically
- [x] Reapex supports plugin, application can be easily extended
- [x] Super lightweight, can be easily intergrated with existing react/redux/redux-sagas application

## Getting started with a simple `Counter` [example](https://github.com/ReapexJS/reapex-example)

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
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

const mapStateToProps = createStructuredSelector({ total: counter.selectors.total })

const mapDispatchToProps = {
  increase: mutations.increase,
  decrease: mutations.decrease,
}

type CounterComponentProps = typeof mapDispatchToProps & ReturnType<typeof mapStateToProps>

const CounterComponent: React.SFC<CounterComponentProps> = props => {
  return (
    <>
      <button onClick={() => props.decrease()}>-</button>
      {props.total}
      <button onClick={() => props.increase(2)}>+2</button>
    </>
  )
}

export const Counter = connect(
  mapStateToProps,
  mapDispatchToProps
)(CounterComponent)

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
