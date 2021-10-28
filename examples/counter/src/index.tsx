import { App } from 'reapex'
import { render } from 'react-dom'
import { useModel } from 'reapex-react'

export const app = new App()

const CounterModel = app.model('Counter', { total: 0 })

const [counterMutations] = CounterModel.mutations({
  increase: () => (s) => ({ ...s, total: s.total + 1 }),
  decrease: () => (s) => ({ ...s, total: s.total - 1 }),
})

const CounterComponent = () => {
  const total = useModel(CounterModel, (s) => s.total)

  return (
    <div>
      Counter:
      <button onClick={counterMutations.decrease}>-</button>
      {total}
      <button onClick={counterMutations.increase}>+</button>
    </div>
  )
}

render(<CounterComponent />, document.getElementById('root'))
