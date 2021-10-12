# reapex-vue
Reapex binding for Vue3

### Install
```bash
yarn add reapex reapex-vue
```

### Setup Vue3 with Reapex

```typescript
// app.ts
import { App } from 'reapex';
export const app = new App();
```

```typescript
// index.ts
import { createApp } from 'vue';
import Counter from './components/Counter.vue';

createApp(Counter).mount('#app');
```

### Create Reapex Model
```typescript
// ./components/Counter.model.ts
import { app } from '@/app'
export const CounterModel = app.model('Counter', 0)

export const [mutations] = CounterModel.mutations({
  increment: () => total => total + 1,
  decrement: () => total => total - 1,
})
```

### Use Model and Mutations in Vue Component
```vue
<!-- ./components/Counter.vue -->
<template>
  <div class="hello">
    <p>
      <button @click="increment">+</button>
      {{ total }}
      <button @click="decrement">-</button>
  </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useModel } from 'reapex-vue'
import { CounterModel, mutations } from "./Counter.model";

export default defineComponent({
  name: 'Counter',
  methods: {
    increment() {
      mutations.increment()
    },
    decrement() {
      mutations.decrement()
    },
  },
  setup() {
    const total = useModel(CounterModel)
    return {total}
  }
});
</script>

```
