import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { GlobalState } from 'reapex'

export interface UseModel {
  <T, S extends (state: T) => any>(model: { namespace: string; getState: () => T }, selector: S): ReturnType<S>
  <T>(model: { namespace: string; getState: () => T }): T
}

export const useModel: UseModel = <T, S extends (state: T) => any>(
  model: { namespace: string; getState: () => T },
  selector?: S
) => {
  const value = useSelector((state: GlobalState) => state[model.namespace]) as T

  const result = useMemo(() => {
    if (selector) {
      return selector(value)
    }
    return value
  }, [selector, value])

  return result
}
