# reapex-react
Reapex binding for React

### How to use:

```typescript
import { useModel } from 'reapex-react'
import { App } from 'reapex'
import { render } from 'react-dom'

export const app = new App()

const CounterModel = app.model('Counter', { total: 50 })

const [mutations] = CounterModel.mutations({
  increase: () => ({ total }) => ({ total: total + 1 }),
  decrease: () => ({ total }) => ({ total: total - 1 }),
})

const CounterComponent = () => {
  const total = useModel(CounterModel, (counter) => counter.total)

  return (
    <div>
      <button onClick={mutations.decrease}>-</button>
      {total}
      <button onClick={mutations.increase}>+</button>
    </div>
  )
}

render(<CounterComponent />, document.getElementById('root'))
```
