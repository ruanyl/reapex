import * as React from 'react'
import { mount } from 'enzyme'

import { MyComponent } from '../src/MyComponent'

describe('<MyComponent />', () => {
  it('should render a component', () => {
    const wrapper = mount(<MyComponent />)
    expect(wrapper.find('div')).toHaveLength(1)
    expect(wrapper.text()).toBe('Hello world')
  })
});
