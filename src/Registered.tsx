import * as React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import { Registry, DeferredComponent } from './registry'

type ChildrenFunction = (Connected: React.ComponentType, props?: any) => any

export interface RegisteredProps {
  name: string;
  children?: ChildrenFunction;
}

export interface RegisteredWrapperProps {
  component: DeferredComponent;
}

export const RegisteredWrapper: React.SFC<RegisteredWrapperProps> = ({component, ...props}) => {
  if (component) {
    return React.createElement(component(), props)
  } else {
    return null
  }
}

export const Registered: React.SFC<RegisteredProps> = ({ name, children, ...props }) => {
  const mapStateToProps = createStructuredSelector<{}, RegisteredWrapperProps>({ component: Registry.mapping.get(name) })
  const Connected = connect<RegisteredWrapperProps, {}, any>(mapStateToProps)(RegisteredWrapper)
  if (typeof children === 'function') {
    return children(Connected, props)
  }
  return <Connected {...props} />
}
