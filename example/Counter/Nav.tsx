import * as React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { payloadReducer } from 'reducer-tools'
import { Link } from 'react-router-dom'

import app from '../app'
import { LocalState, StateObject } from 'immutable-state-creator';

interface Fields {
  items: List<string>
}

const initialState = { items: List(['home', 'hello', 'about']) }

app.model('Nav', initialState, {
  mutations: Nav => {
    const push = (item: string) => (s: LocalState<Fields>) => {
      const items = Nav.get('items')(s)
      return Nav.set('items', items.push(item))
    }
    return {
      push: payloadReducer(push)
    }
  }
})

const NavComponent: React.SFC<{ items: List<string> }> = props => {
  return (
    <div>
      {props.items.map(item => <Link key={item} to={`/${item}`}>{item}</Link>)}
    </div>
  )
}

const NavContainer = app.use(({Nav: NavState}: {Nav: StateObject<Fields, keyof Fields>}) => {
  const mapStateToProps = createStructuredSelector({ items: NavState.get('items') })
  return connect(
    mapStateToProps,
    {}
  )(NavComponent as any)
})

app.register('nav', NavContainer)
