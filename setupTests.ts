import 'jest-enzyme'
import * as Enzyme from 'enzyme'
import * as EnzymeAdapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new EnzymeAdapter() });
