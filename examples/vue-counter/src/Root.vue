<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <Counter/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Counter from './components/Counter.vue';

export default defineComponent({
  name: 'Root',
  components: {
    Counter,
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
