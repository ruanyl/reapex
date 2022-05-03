# Reapex 
[![travis-ci](https://travis-ci.org/ruanyl/reapex.svg?branch=master)](https://travis-ci.org/github/ruanyl/reapex)
![github-workflow](https://github.com/ruanyl/reapex/workflows/CI/badge.svg)
[![npm](https://img.shields.io/npm/v/reapex.svg)](https://www.npmjs.com/package/reapex)
[![issues](https://img.shields.io/github/issues/ruanyl/reapex)](https://github.com/ruanyl/reapex/issues)
[![license](https://img.shields.io/github/license/ruanyl/reapex)](https://github.com/ruanyl/reapex/blob/master/LICENSE.md)


Intuitive state management and data flow orchestration library which provides seamless development experience for React and Vue application.


#### [Documentation](https://reapex.gitbook.io/docs/)

## Examples

### Run example
Examples are under `examples` folder.

```
yarn example:counter
yarn example:vue-counter
```
Or check out live examples:

1. [Counter](https://codesandbox.io/s/reapex-example-counter-oluew)
2. [Todo List](https://codesandbox.io/s/todo-list-examle-reapex-2n4qc?file=/src/index.tsx)
3. [Login Form](https://codesandbox.io/s/reapex-login-form-06eq1)
4. [Vue Counter](https://codesandbox.io/s/vue-counter-jgb5u?file=/src/main.ts)

## Getting started with a simple React `Counter` example

```
npm i reapex reapex-react --save
```

### Example
```typescript
import React from 'react'
import { render } from 'react-dom'
import { App } from 'reapex'
import { useModel } from 'reapex-react'

const app = new App()

// Create a model(state)
const CounterModel = app.model('Counter', 0)

// Define the mutations: how you want the state to be mutated
const [mutations] = CounterModel.mutations({
  increase: () => total => total + 1,
  decrease: () => total => total - 1,
})

// useModel in the component
export const Counter = () => {
  const total = useModel(CounterModel)

  return (
    <>
      <button onClick={mutations.decrease}>-</button>
      {total}
      <button onClick={mutations.increase}>+</button>
    </>
  )
}

// Render it!
render(<Counter />, document.getElementById('root'))
```


## Integrate with immerjs
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

## Work with Local Storage

```typescript
import { App } from 'reapex'
import createLocalStoragePlugin from 'reapex-plugin-local-storage'

// 1. Initialize the plugin
const { plugin, persist } = createLocalStoragePlugin()
const app = new App()

// 2. register the plugin
app.plugin(plugin)

// 3. Simply wrap a `model` with `persist`
const UserModel = app.model('User', { name: '', age: 0 })
persist(UserModel)
```

Checkout [reapex-plugin-local-storage](https://github.com/ruanyl/reapex/blob/master/packages/reapex-plugin-local-storage/README.md)
