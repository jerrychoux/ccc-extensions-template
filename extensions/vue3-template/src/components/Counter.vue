<template>
  <h2>{{ counter }}</h2>
  <ui-button class="blue" @confirm="addition">+</ui-button>
  <ui-button @confirm="subtraction">-</ui-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const counter = ref(0)

function addition() {
  log('add')
  counter.value += 1
}
function subtraction() {
  warn('sub')
  counter.value -= 1
}
</script>

<style scoped></style>
