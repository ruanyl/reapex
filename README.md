# Reapex 
[![travis-ci](https://travis-ci.org/ruanyl/reapex.svg?branch=master)](https://travis-ci.org/github/ruanyl/reapex)
![github-workflow](https://github.com/ruanyl/reapex/workflows/CI/badge.svg)
[![npm](https://img.shields.io/npm/v/reapex.svg)](https://www.npmjs.com/package/reapex)
[![issues](https://img.shields.io/github/issues/ruanyl/reapex)](https://github.com/ruanyl/reapex/issues)
[![license](https://img.shields.io/github/license/ruanyl/reapex)](https://github.com/ruanyl/reapex/blob/master/LICENSE.md)


Reapex is a lightweight "framework" written in TypeScript to build pluggable and extendable redux(react) application. It greatly reduced the boilerpates of a regular redux based application.

Reapex is designed in a way that modules have a clear boundary with each other. It provides strong-typed everything out of the box.

You can use reapex to create shareable modules easily. And share the modules among projects or publishing to npm and share with the public. Such as [reapex-plugin-dataloader](https://github.com/ReapexJS/reapex-plugin-dataloader)


#### Built with the love of TypeScript
> Reapex is written with TypeScript and it provides strong-typed state, selectors, actions.

#### [Documentation](https://reapex.gitbook.io/docs/)

## Examples

1. [Counter](https://codesandbox.io/s/reapex-example-counter-oluew): A simple Counter example
2. [Login Form](https://codesandbox.io/s/reapex-login-form-06eq1): Side effects handling with the demo of API call

## Getting started with a simple `Counter` example

```
npm i reapex@beta --save
```
#### Peer dependencies
```
npm i react react-dom --save
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
const [mutations] = CounterModel.mutations({
  increase: () => s => ({total: s.total + 1}),
  decrease: () => s => ({total: s.total - 1}),
})
```

### 4. Connect it with Component
```typescript
import React from 'react'

export const Counter = () => {
  const total = CounterModel.useState(state => state.total)

  return (
    <>
      <button onClick={mutations.decrease}>-</button>
      {total}
      <button onClick={mutations.increase}>+</button>
    </>
  )
}
```

### 5. Render it!
```typescript
app.render(Counter, document.getElementById('root'))
```

## Use Immutable Record as the state
```typescript
import { Record } from 'immutable'

const CounterState = Record({ total: 0 })
const CounterModel = app.model('Counter', new CounterState())

// the state here is an Immutable Record
const [mutations] = counter.mutations({
  increase: () => s => s.set('total', s.total + 1),
  decrease: () => s => s.set('total', s.total - 1),
})
```

## Integration with immerjs
```typescript
import immerPlugin from 'reapex-plugin-immer'

app.plugin(immerPlugin)

const CounterModel = app.model('Counter', { total: 0 })
const [mutations] = counter.mutations({
  increase: () => s => {
    s.total = s.total + 1
    return s
  },
  decrease: () => s => {
    s.total = s.total - 1
    return s
  },
})
```
Checkout [reapex-plugin-immer](https://github.com/ReapexJS/reapex-plugin-immer)
