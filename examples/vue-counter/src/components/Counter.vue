<template>
  <div class="hello">
    <p>
      <button @click="decrement">-</button>
      {{ counter }}
      <button @click="increment">+</button>
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
