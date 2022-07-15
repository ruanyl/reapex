<template>
  <img alt="Vue logo" src="../assets/logo.png">
  <div class="hello">
    <p>
      <button @click="decrement">-</button>
      {{ total }}
      <button @click="increment">+</button>
  </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {useModel} from 'reapex-vue'
import {CounterModel, mutations} from "./Counter.model";

export default defineComponent({
  name: 'counter-component',
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
