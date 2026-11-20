<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
import FooterBar from './components/FooterBar.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar />

    <main class="container py-4 flex-grow-1" style="max-width: 960px">
      <RouterView />
    </main>

    <FooterBar />
  </div>
</template>