# Tutorial 4: Cross-Model Communication - Subscriptions

Micro-frontend becomes a thing as the single-page application becomes more complex and monolithic. Reapex is designed with micro-frontend architecture in mind by trying to enforce clear model boundaries.

In a large single-page application, there are usually a bunch of data models(state) defined such as UI state, user input, remote data, etc. And the communications among models make the application as a whole. However, sometimes the cross-model communications break the boundaries and increase the code complexity.

Let's see how reapex handles cross-model communications. We will continue with the previous example of a sign-up form and add a todo-list feature that fetches a list of to-do items from remote after the user logged in.

**Create the model and mutations:**

```typescript
interface Todo {
  id: number
  title: string
  completed: boolean
}

const initialState: Todo[] = []
export const todoModel = app.model('Todo', initialState)

const [mutations] = todoModel.mutations({
  setTodos: (todos: Todo[]) => () => todos,
  toggle: (todo: Todo) => (todos) => {
    const idx = todos.findIndex((t) => t.id === todo.id)
    if (idx >= 0) {
      return [...todos.slice(0, idx), { ...todo, completed: !todo.completed }, ...todos.slice(idx + 1, todos.length)]
    }
    return todos
  },
})
```

A fake `fetchTodos` function to simulate the request

```typescript
async function fetchTodos() {
  return new Promise<Todo[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'item 1', completed: false },
        { id: 2, title: 'item 2', completed: true },
      ])
    }, 1000)
  })
}
```

We will need to listen to the `loggedIn` mutation to happen in `User` model, once it's  triggered, we will call `fetchTodos` and update the `Todo` model with the to-do list returned.

We might come up with defining a side-effect for `loggedIn` mutation naturally like we did for `setUsername` and call the `fetchTodos`function as a side-effect of `loggedIn`. Once the todo list returned, call `setTodos` mutation to update the state of `Todo` model.

```typescript
// This is UserModel, but here we import from TodoModel
// This breaks the module boundary
import {mutations as todoMutations} from './TodoModel'

userModel.effects({
  async loggedIn() {
    const todos = await fetchTodos()
    todoMutations.setTodos(todos)
  }
})
```

But this approach creates coupling between `User` model and `Todo` model as we are mutating the state of `Todo` directly from `User`. The application logic of fetching todos and update the state should belong to `Todo` model but now it is in `User` model. There is no longer a clear boundary between the two models anymore.

That means the developer who is working on the to-do list feature will need to dig into `User` model to figure out what's happening. And since we are importing the Todo mutations to the User model, it will become difficult to do code-splitting and dynamic loading. And it also makes it difficult to delete the code, for example, if one day we need to delete the Todo list feature, we will need to touch multiple places.

To make clear boundaries among models, reapex introduced an API called `subscriptions` that one model can subscribe to the external signals. Here is what we can do with `subscriptions`

```typescript
todoModel.subscriptions({
  'User/loggedIn': async () => {
    const todos = await fetchTodos()
    mutations.setTodos(todos)
  },
})
```

The string `User/loggedIn` declares the model `User` and the mutation `loggedIn`. And the `subscriptions()` function has the same signature as `effects()` which also supports `throttle` `debounce` and `takeLeading` and it also supports advanced usage with the saga.

As you can see, now the Todo model is completely self-contained. There is no direct connection between `User` and `Todo`.  And the code `Todo` model is optimized for deletion, we can simply remove the entire model without touching the rest of the code.

See the full example [here](https://codesandbox.io/s/user-sign-up-cross-model-eqhgf?file=/src/todos.tsx)
