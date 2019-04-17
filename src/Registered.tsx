import React, { ComponentType } from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import { registrySelector } from './registry'

export type ChildrenFunction = (Connected: React.ComponentType, props?: any) => any

export interface RegisteredProps {
  name: string
  lazy?: () => Promise<any>
  children?: ChildrenFunction
}

export interface RegisteredWrapperProps {
  component?: ComponentType<any>;
  lazy?: () => Promise<any>
}

export const RegisteredWrapper: React.SFC<RegisteredWrapperProps> = ({component, lazy, ...props}) => {
  if (component) {
    return React.createElement(component, props)
  } else if (lazy) {
    lazy().then(() => {})
  }
  return null
}

export const Registered: React.SFC<RegisteredProps> = ({ name, children, ...props }) => {
  const mapStateToProps = createStructuredSelector<{}, RegisteredWrapperProps>({ component: registrySelector(name) })
  const Connected = connect<RegisteredWrapperProps, {}, any>(mapStateToProps)(RegisteredWrapper)
  if (typeof children === 'function') {
    return children(Connected, props)
  }
  return <Connected {...props} />
}
