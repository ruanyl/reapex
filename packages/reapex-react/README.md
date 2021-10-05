# reapex-react
React binding of reapex

### How to use:

```typescript
import { render, useModel } from 'reapex-react'
import { App } from 'reapex'

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

render(CounterComponent, app, document.getElementById('root'))
```
