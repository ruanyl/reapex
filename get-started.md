# Tutorial 1: Get Started

### 1. Start with creating an `App` instance

```typescript
import { App } from 'reapex'

const app = new App()
```

### 2. Create a Model

A model is a collection of domain-specific data with a namespace.

```typescript
// Model example of `User`
const userModel = app.model('User', { username: 'foo', password: '123' })
```

The above codes create an `User` model which has an initial state of `{ username: 'foo', password: '123' }` 

### **3. Create Mutations**

The mutations define a set of operations of how the model will be updated. Use `model.mutations()` function to create mutations

`model.mutations()`  accepts an object as the first parameter which key is the name of the operation, value is a function that describes the mutation input and output. For example, to mutate `user.username` and `user.password` we can have the following `mutations` 

```typescript
const [userMutations] = userModel.mutations({
  setUsername: (username: string) => user => ({...user, username}),
  setPassword: (password: string) => user => ({...user, password}),
})
```

The mutation function `(username: string) => user => ({...user, username})` is a curried function that accepts an input `username` and together with the current user to produce a new user state.

The mutation functions should follow the pattern which 

1. The "outer" function args are the inputs
2. The "inner" function arg is the current model state
3. It should return a new model state

### 4. Use in a Component

Assume we are implementing a user sign-up form:

```typescript
import { App } from 'reapex'
import React from 'react'
import { useModel } from 'reapex-react'

const app = new App()
const userModel = app.model('User', { username: '', password: '' })

const [userMutations] = userModel.mutations({
  setUsername: (username: string) => user => ({...user, username}),
  setPassword: (password: string) => user => ({...user, password}),
})

export const SignupForm = () => {
  const { username, password } = useModel(userModel)

  return (
    <div>
      <input
        value={user.username}
        onChange={(e) => mutations.setUsername(e.target.value)}
      />
      <input
        value={user.password}
        onChange={(e) => mutations.setPassword(e.target.value)}
        type="password"
      />
      <button>Submit</button>
    </div>
  )
}
```

In the above example, the component uses`useModel` hook to connect the component with the user model.

### Render it

```typescript
import {render} from 'react-dom'

render(<SignUpForm />, document.getElementById('root'))
```

See the full running example [here](https://codesandbox.io/s/user-sign-up-example-714f7)
