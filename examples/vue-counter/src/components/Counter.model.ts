import { app } from '@/app'

export const CounterModel = app.model('Counter', 0)

export const [mutations] = CounterModel.mutations({
  increment: () => total => total + 1,
  decrement: () => total => total - 1,
})

CounterModel.effects({
  async increment() {
    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })
    console.log('increment delay')
  },
})
