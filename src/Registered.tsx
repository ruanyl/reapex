import * as React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'

import { Registry } from './registry'

export interface RegisteredProps {
  name: string;
}

export interface RegisteredWrapperProps {
  component: React.ComponentType<any>;
}

export const RegisteredWrapper: React.SFC<RegisteredWrapperProps> = ({component, ...props}) => {
  if (component) {
    return React.createElement(component, props)
  } else {
    return null
  }
}

export const Registered: React.SFC<RegisteredProps> = ({ name, ...props }) => {
  const mapStateToProps = createStructuredSelector<{}, RegisteredWrapperProps>({ component: Registry.mapping.get(name) })
  const Connected = connect<RegisteredWrapperProps, {}, any>(mapStateToProps)(RegisteredWrapper)
  return <Connected {...props} />
}
