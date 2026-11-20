<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api, { apiError } from '../api'
import { notyf } from '../main'

const name = ref('')
const duration = ref('')
const unit = ref('mins') // 'mins' | 'hrs'
const busy = ref(false)

const unitLabel = computed(() => (unit.value === 'hrs' ? 'Hours' : 'Minutes'))

// The schema stores duration as a string, so keep the unit with the number.
async function addWorkout() {
  busy.value = true
  try {
    const res = await api.post('/workouts/addWorkout', {
      name: name.value.trim(),
      duration: `${duration.value} ${unit.value}`,
    })
    notyf.success(`Added "${res.data.workout.name}".`)
    name.value = ''
    duration.value = ''
    unit.value = 'mins'
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="mb-4">
    <h1 class="h3 mb-1">Add Workout</h1>
    <p class="text-secondary small mb-0">Log a workout</p>
  </div>

  <div class="card shadow-sm" style="max-width: 480px">
    <div class="card-body">
      <form class="d-grid gap-3" @submit.prevent="addWorkout">
        <div>
          <label for="name" class="form-label">Workout name</label>
          <input
            id="name"
            v-model="name"
            class="form-control"
            required
            placeholder="Morning run"
          />
        </div>
        <div>
          <label for="duration" class="form-label">Duration</label>
          <div class="row g-2">
            <div class="col-7">
              <input
                id="duration"
                v-model="duration"
                type="number"
                min="0"
                step="any"
                class="form-control"
                required
              />
            </div>
            <div class="col-5">
              <select v-model="unit" class="form-select" aria-label="Duration unit">
                <option value="mins">mins</option>
                <option value="hrs">hrs</option>
              </select>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" type="submit" :disabled="busy">Add Workout</button>
      </form>
    </div>
  </div>

  <RouterLink to="/workouts" class="d-inline-block mt-3">Back to my workouts</RouterLink>
</template>