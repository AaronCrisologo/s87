<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import api, { apiError, setSession } from '../api'
import { notyf } from '../main'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const busy = ref(false)

async function login() {
  busy.value = true
  try {
    const res = await api.post('/users/login', {
      email: email.value.trim(),
      password: password.value,
    })
    setSession(res.data)

    // Honour ?redirect= when a guard sent the user here.
    const redirect = route.query.redirect
    const target = typeof redirect === 'string' && redirect ? redirect : '/workouts'

    notyf.success('Logged in.')
    router.push(target)
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mb-4">
    <h1 class="h3 mb-1">Login</h1>
    <p class="text-secondary small mb-0">Log in to see and log your workouts.</p>
  </div>

  <div class="card shadow-sm" style="max-width: 480px">
    <div class="card-body">
      <form class="d-grid gap-3" @submit.prevent="login">
        <div>
          <label for="log-email" class="form-label">Email</label>
          <input
            id="log-email"
            v-model="email"
            type="email"
            class="form-control"
            required
            autocomplete="email"
          />
        </div>
        <div>
          <label for="log-password" class="form-label">Password</label>
          <input
            id="log-password"
            v-model="password"
            type="password"
            class="form-control"
            required
            autocomplete="current-password"
          />
        </div>
        <button class="btn btn-primary" type="submit" :disabled="busy">Login</button>
      </form>
    </div>
  </div>

  <p class="small mt-3 mb-0">
    No account yet? <RouterLink to="/register">Register</RouterLink>.
  </p>
</template>