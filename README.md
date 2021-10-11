# Reapex 
[![travis-ci](https://travis-ci.org/ruanyl/reapex.svg?branch=master)](https://travis-ci.org/github/ruanyl/reapex)
![github-workflow](https://github.com/ruanyl/reapex/workflows/CI/badge.svg)
[![npm](https://img.shields.io/npm/v/reapex.svg)](https://www.npmjs.com/package/reapex)
[![issues](https://img.shields.io/github/issues/ruanyl/reapex)](https://github.com/ruanyl/reapex/issues)
[![license](https://img.shields.io/github/license/ruanyl/reapex)](https://github.com/ruanyl/reapex/blob/master/LICENSE.md)


State management and data flow orchastration library for React and Vue application.


#### [Documentation](https://reapex.gitbook.io/docs/)

## Examples

### Run example
Examples are under `examples` folder.

```
yarn example:counter
yarn example:vue-counter
```
Or check out live examples:

1. [Counter](https://codesandbox.io/s/reapex-example-counter-oluew): A simple Counter example
2. [Login Form](https://codesandbox.io/s/reapex-login-form-06eq1): Side effects handling with the demo of API call

## Getting started with a simple React `Counter` example

```
npm i reapex@beta reapex-react@beta --save
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
import { useModel } from 'reapex-react'

export const Counter = () => {
  const total = useModel(CounterModel, state => state.total)

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
import { render } from 'react-dom'
render(<Counter />, document.getElementById('root'))
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
