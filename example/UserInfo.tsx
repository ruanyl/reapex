import React from 'react'
import { useSelector } from 'react-redux'

import app from './app'

const initialState = { name: '', age: 0 }

const UserInfoModel = app.model('UserInfo', initialState)

const [mutations] = UserInfoModel.mutations({
  setUserName: (name: string) => (state) => ({ ...state, name }),
  setUserAge: (age: number) => (state) => ({ ...state, age }),
})

export const UserInfo: React.FC = () => {
  const username = useSelector(UserInfoModel.selectors.name)
  const age = useSelector(UserInfoModel.selectors.age)

  return (
    <div>
      <div>
        User Name:
        <input type="text" value={username} onChange={(e) => mutations.setUserName(e.target.value)} />
      </div>
      <div>
        Age:
        <input
          type="number"
          value={age}
          onChange={(e) => mutations.setUserAge(e.target.value ? parseInt(e.target.value, 10) : 0)}
        />
      </div>
    </div>
  )
}
