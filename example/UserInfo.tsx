import React from 'react'
import { Record as ImmutableRecord } from 'immutable'
import { useDispatch, useSelector } from 'react-redux'

import app from './app'

const UserState = ImmutableRecord({ name: '', age: 0 })
const initialState = new UserState()

const UserInfoModel = app.model('UserInfo', initialState)

const [mutations] = UserInfoModel.mutations({
  setUserName: (name: string) => state => state.set('name', name),
  setUserAge: (age: number) => state => state.set('age', age),
})

export const UserInfo: React.FC = () => {
  const username = useSelector(UserInfoModel.selectors.name)
  const age = useSelector(UserInfoModel.selectors.age)
  const dispatch = useDispatch()

  return (
    <div>
      <div>
        User Name:
        <input type="text" value={username} onChange={e => dispatch(mutations.setUserName(e.target.value))} />
      </div>
      <div>
        Age:
        <input
          type="number"
          value={age}
          onChange={e => dispatch(mutations.setUserAge(e.target.value ? parseInt(e.target.value, 10) : 0))}
        />
      </div>
    </div>
  )
}
