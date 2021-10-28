import { App } from 'reapex'
import createLocalStoragePlugin from 'reapex-plugin-local-storage'
import { render } from 'react-dom'
import { useModel } from 'reapex-react'

const { plugin, persist } = createLocalStoragePlugin()

export const app = new App()
app.plugin(plugin)

const UserModel = app.model('User', { name: '', age: 0 })
persist(UserModel)

const [userMutations] = UserModel.mutations({
  setName: (name: string) => (s) => ({ ...s, name }),
  setAge: (age: number) => (s) => ({ ...s, age }),
})

const UserComponent = () => {
  const { age, name } = useModel(UserModel)

  return (
    <div>
      <div>
        User: <input type="text" value={name} onChange={(e) => userMutations.setName(e.target.value)} />
      </div>
      <div>
        Age: <input type="number" value={age} onChange={(e) => userMutations.setAge(Number(e.target.value))} />
      </div>
    </div>
  )
}

render(
  <div>
    <UserComponent />
  </div>,
  document.getElementById('root')
)
