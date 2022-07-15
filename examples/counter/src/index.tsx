import { App } from 'reapex'
import { createRoot } from 'react-dom/client'
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

const container = document.getElementById('root')

if (container) {
  const root = createRoot(container)
  root.render(<CounterComponent />)
}
