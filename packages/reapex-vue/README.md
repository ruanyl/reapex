# reapex-vue
Reapex binding for Vue3

### Install
```bash
yarn add reapex reapex-vue
```

### Setup Vue3 with Reapex

```typescript
// app.ts
import { App } from "reapex";

export const app = new App();
```

```typescript
// index.ts
import reapexPlugin from "reapex-vue";
import { createApp } from "vue";

import Root from "./Root.vue";
import { app as reapexApp } from "./app";

const app = createApp(Root);

app.use(reapexPlugin, reapexApp).mount("#app");
```

### Create Reapex Model
```typescript
import { app } from "./app";

export const CounterModel = app.model("Counter", { count: 0 });

export const [mutations] = CounterModel.mutations({
  increment: () => (s) => ({ count: s.count + 1 }),
  decrement: () => (s) => ({ count: s.count - 1 }),
});
```

### Use Model and Mutations in Vue Component
```vue
<template>
  <div class="hello">
    <p>
      <button @click="increment">+</button>
      {{ counter.count }}
      <button @click="decrement">-</button>
  </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useModel} from 'reapex-vue'
import {CounterModel, mutations} from "./Counter.model";

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
    const counter = useModel(CounterModel)
    return {counter}
  }
});
</script>

```
