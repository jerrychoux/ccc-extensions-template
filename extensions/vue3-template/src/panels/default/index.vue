<script setup lang="ts">
import Counter from '../../components/Counter.vue'

function onAboutClick() {
  Editor.Panel.open(`${__EXTENSION_NAME__}.about`)
}
</script>

<template>
  <div>hello world</div>
  <Counter></Counter>
  <img src="./free.png" width="100" height="100" draggable="false" />
  <ui-button @confirm="onAboutClick">about</ui-button>
</template>

<style scoped></style>
