<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { clearSession, token } from '../api'

const router = useRouter()
const loggedIn = computed(() => Boolean(token.value))

function logout() {
  clearSession()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand bg-white border-bottom sticky-top">
    <div class="container">
      <RouterLink to="/" class="navbar-brand fw-semibold">Fitness Tracker</RouterLink>
      <ul class="navbar-nav ms-auto gap-3">
        <template v-if="loggedIn">
          <li class="nav-item">
            <RouterLink to="/workouts" class="nav-link">Workouts</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/addWorkouts" class="nav-link">Add Workouts</RouterLink>
          </li>
          <li class="nav-item d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="logout">
              Logout
            </button>
          </li>
        </template>
        <li class="nav-item d-flex align-items-center gap-2" v-else>
          <RouterLink to="/register" class="nav-link px-0">Register</RouterLink>
          <RouterLink to="/login" class="btn btn-sm btn-primary">Login</RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>