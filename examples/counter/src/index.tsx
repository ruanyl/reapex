import { App } from 'reapex'
import { render } from 'reapex-react'
import { useSelector } from 'react-redux'

export const app = new App()

const CounterModel = app.model('Counter', { total: 50 })

const [mutations] = CounterModel.mutations({
  increase:
    () =>
    ({ total }) => ({ total: total + 1 }),
  decrease:
    () =>
    ({ total }) => ({ total: total - 1 }),
})

const CounterComponent = () => {
  const total = useSelector(CounterModel.selectors.total)

  return (
    <div>
      <button onClick={mutations.decrease}>-</button>
      {total}
      <button onClick={mutations.increase}>+</button>
    </div>
  )
}

render(CounterComponent, app, document.getElementById('root'))
