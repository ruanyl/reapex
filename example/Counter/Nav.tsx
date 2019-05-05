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

nav.mutations({
  push: (item: string) => s => {
    const items = nav.state.get('items')(s)
    return nav.state.set('items', items.push(item))(s)
  }
})

const mapStateToProps = createStructuredSelector({ items: nav.state.get('items') })

type NavComponentProps = ReturnType<typeof mapStateToProps>

const NavComponent: React.SFC<NavComponentProps> = props => {
  return (
    <div>
      {props.items.map(item => <Link key={item} to={`/${item}`}>{item}</Link>)}
    </div>
  )
}


app.register('nav', connect(mapStateToProps, null)(NavComponent))
