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
  console.log('counter render!')

  return (
    <div>
      Counter:
      <button onClick={counterMutations.decrease}>-</button>
      {total}
      <button onClick={counterMutations.increase}>+</button>
    </div>
  )
}

const UserModel = app.model('User', { name: '', age: 0 })

const [userMutations] = UserModel.mutations({
  setName: (name: string) => (s) => ({ ...s, name }),
  setAge: (age: number) => (s) => ({ ...s, age }),
})

const UserComponent = () => {
  const name = useModel(UserModel, (s) => s.name)
  console.log('User render!')

  return (
    <div>
      User: <input type="text" value={name} onChange={(e) => userMutations.setName(e.target.value)} />
    </div>
  )
}

const AgeComponent = () => {
  const name = useModel(UserModel, (s) => s.age)
  console.log('Age render!')

  return (
    <div>
      Age: <input type="number" value={name} onChange={(e) => userMutations.setAge(Number(e.target.value))} />
    </div>
  )
}

render(
  <div>
    <CounterComponent />
    <UserComponent />
    <AgeComponent />
  </div>,
  document.getElementById('root')
)
