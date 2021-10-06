import { app } from '@/app'

export const CounterModel = app.model('Counter', { count: 0 })

export const [mutations] = CounterModel.mutations({
  increment: () => s => ({ count: s.count + 1 }),
  decrement: () => s => ({ count: s.count - 1 }),
})

CounterModel.effects({
  async increment() {
    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })
    console.log('increment delay')
  },
})
