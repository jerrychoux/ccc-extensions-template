<script setup>
import { ref } from 'vue'
import logoImg from '@assets/logo.svg'

const description = ref('This is a simple About panel showing some information about the app.')
</script>

<template>
  <div class="about">
    <img class="logo" :src="logoImg" width="100" height="100" alt="Logo" />
    <div class="content">
      <h1>About Us</h1>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.logo {
  margin-bottom: 20px;
}

.content {
  text-align: center;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
}
</style>
