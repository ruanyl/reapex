import { render, useModel } from 'reapex-react'

import { App } from 'reapex'

export const app = new App()

const CounterModel = app.model('Counter', 50)

const [mutations] = CounterModel.mutations({
  increase: () => (total) => total + 1,
  decrease: () => (total) => total - 1,
})

const CounterComponent = () => {
  const total = useModel(CounterModel)

  return (
    <div>
      <button onClick={mutations.decrease}>-</button>
      {total}
      <button onClick={mutations.increase}>+</button>
    </div>
  )
}

render(CounterComponent, app, document.getElementById('root'))
