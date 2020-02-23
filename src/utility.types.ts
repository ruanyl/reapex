import { AnyAction } from 'redux'

export type MutationsReturnType<
  T extends Record<string, (...args: any) => AnyAction>
> = {
  [K in keyof T]: ReturnType<T[K]>
}
