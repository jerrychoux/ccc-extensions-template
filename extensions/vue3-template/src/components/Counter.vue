<template>
  <h2>{{ counter }}</h2>
  <ui-button class="blue" @click="addition">+</ui-button>
  <ui-button @click="subtraction">-</ui-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const counter = ref(0)

function addition() {
  counter.value += 1
}
function subtraction() {
  counter.value -= 1
}
</script>

<style scoped></style>
