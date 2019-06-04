import * as React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { Link } from 'react-router-dom'

import app from '../app'

interface Fields {
  items: List<string>
}

const initialState = { items: List(['home', 'hello', 'about']) }

const nav = app.model<Fields>('Nav', initialState)

const [mutations, actionTypes] = nav.mutations({
  push: (item?: string) => s => {
    if (item) {
      const items = nav.state.get('items')(s)
      return nav.state.set('items', items.push(item))(s)
    }
    return s
  }
})

console.log(actionTypes)

const mapStateToProps = createStructuredSelector({ items: nav.state.get('items') })
const mapDispatchToProps = {
  push: mutations.push
}

type NavComponentProps = ReturnType<typeof mapStateToProps>
type DispatchedProps = typeof mapDispatchToProps

const NavComponent: React.SFC<NavComponentProps & DispatchedProps> = props => {
  return (
    <div>
      {props.items.map(item => <Link key={item} to={`/${item}`} onClick={() => props.push()}>{item}</Link>)}
    </div>
  )
}

export const Nav = connect(mapStateToProps, mapDispatchToProps)(NavComponent)
