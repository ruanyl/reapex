import * as React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { List } from 'immutable'
import { payloadReducer } from 'reducer-tools'

import app from '../app'

app.model<{items: List<string>}>({
  name: 'Nav',
  fields: {
    items: List(['Home', 'About']),
  },
  mutations: Nav => ({
    push: payloadReducer(Nav.items.push)
  })
})

const NavComponent: React.SFC<{ items: List<string> }> = props => {
  return (
    <div>
      {props.items.map(item => <a href={`/${item}`}>{item}</a>)}
    </div>
  )
}

const NavContainer = app.use(({Nav: NavState}: any, {Nav: NavActions}: any) => {
  const mapStateToProps = createStructuredSelector({ items: NavState.items.getter })
  return connect(
    mapStateToProps,
    {}
  )(NavComponent as any)
})

app.register('nav', NavContainer)
