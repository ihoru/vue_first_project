<script lang="ts" setup>
import {ref} from "vue";

const showHelp = ref(false);

function toggleHelp() {
  showHelp.value = !showHelp.value;
}
</script>

<template>
  <blockquote>
    <h3 @click="toggleHelp">
      <span v-show="!showHelp">&mapstodown;</span>
      <span v-show="showHelp">&mapstoup;</span>
      Help / shortcuts / hotkeys
    </h3>
    <ul v-show="showHelp">
      <li><code>Ctrl + Z</code> | <code>Ctrl + Shift + Z</code> &mdash; undo / redo</li>
      <li>...</li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </blockquote>
</template>

<style scoped>
h3 {
  cursor: help;
}
</style>