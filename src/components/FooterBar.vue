<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-top bg-white py-3 mt-auto">
    <div class="container d-flex flex-wrap justify-content-between gap-2 small text-secondary">
      <span>Fitness Tracker</span>
      <span>© {{ year }}</span>
    </div>
  </footer>
</template>