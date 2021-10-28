### Reapex immer plugin

```typescript
import { App } from 'reapex'
import immer from 'reapex-plugin-immer'

const app = new App()

// 1. register the plugin
app.plugin(immer)

// 2. in mutations, we can expect the state it receives as an immer draft object
interface TodoState {
  todos: string[]
}

const initial: TodoState = {
  todos: [],
}

const TodoModel = app.model('todos', initial)

const [mutations] = TodoModel.mutations({
  add: (todo: string) => state => {
    // the state here is an immer draft
    state.todos.push(todo)
    return state
  },
})

```
