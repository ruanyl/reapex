import { T } from 'ramda'

import { createActions } from '../src/createActions'

describe('createActions', function() {
  let mutations
  beforeEach(function() {
    mutations = {
      'Counter/increase': T,
      'decrease': T,
    }
  });

  it('should create actions', function() {
    const actionCreators = createActions('Counter')(mutations)
    expect(actionCreators.increase()).toEqual({ type: 'Counter/increase' })
    expect(actionCreators.decrease()).toEqual({ type: 'Counter/decrease' })
  });
});

