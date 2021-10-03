import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { StateObject, StateShape } from 'reapex'

export interface UseModel {
  <T extends StateShape, S extends (state: T) => any>(model: { state: StateObject<T> }, selector: S): ReturnType<S>
  <T extends StateShape>(model: { state: StateObject<T> }): T
}

export const useModel: UseModel = <T extends StateShape, S extends (state: T) => any>(
  model: { state: StateObject<T> },
  selector?: S
) => {
  const value = useSelector(model.state.selectors.self)

  const result = useMemo(() => {
    if (selector) {
      return selector(value)
    }
    return value
  }, [selector, value])

  return result
}
