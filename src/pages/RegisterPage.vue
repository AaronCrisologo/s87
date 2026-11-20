<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import api, { apiError } from '../api'
import { notyf } from '../main'

const email = ref('')
const password = ref('')
const busy = ref(false)

async function register() {
  busy.value = true
  try {
    await api.post('/users/register', {
      email: email.value.trim(),
      password: password.value,
    })
    notyf.success('Registered! You can log in now.')
    password.value = ''
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mb-4">
    <h1 class="h3 mb-1">Register</h1>
    <p class="text-secondary small mb-0">Create an account to start logging workouts.</p>
  </div>

  <div class="card shadow-sm" style="max-width: 480px">
    <div class="card-body">
      <form class="d-grid gap-3" @submit.prevent="register">
        <div>
          <label for="reg-email" class="form-label">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            class="form-control"
            required
            autocomplete="email"
          />
        </div>
        <div>
          <label for="reg-password" class="form-label">Password</label>
          <input
            id="reg-password"
            v-model="password"
            type="password"
            class="form-control"
            required
            autocomplete="new-password"
          />
        </div>
        <button class="btn btn-primary" type="submit" :disabled="busy">Register</button>
      </form>
    </div>
  </div>

  <p class="small mt-3 mb-0">
    Already have an account? <RouterLink to="/login">Log in</RouterLink>.
  </p>
</template>