<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api, { apiError } from '../api'
import { notyf } from '../main'

const workouts = ref([])
const loading = ref(true)
const busyId = ref('')
const search = ref('')
const editingId = ref('')
const editName = ref('')
const editDuration = ref('')

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return workouts.value
  return workouts.value.filter(
    (w) => w.name.toLowerCase().includes(term) || w.status.toLowerCase().includes(term)
  )
})

// Duration is stored as a string like "30 mins" or "1.5 hrs".
function minutesOf(duration) {
  const value = parseFloat(duration)
  if (Number.isNaN(value)) return 0
  return /hr|hour/i.test(String(duration)) ? value * 60 : value
}

function formatDuration(duration) {
  const text = String(duration ?? '').trim()
  if (!text) return ''

  const value = parseFloat(text)
  if (Number.isNaN(value)) return text

  const isHours = /hr|hour/i.test(text)
  const mins = Math.round(isHours ? value * 60 : value)

  if (mins < 60) return `${mins} mins`
  const hours = Math.round((mins / 60) * 10) / 10
  return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`
}

const stats = computed(() => {
  const completed = workouts.value.filter((w) => w.status === 'completed')
  return {
    total: workouts.value.length,
    completed: completed.length,
    pending: workouts.value.length - completed.length,
    minutes: completed.reduce((sum, w) => sum + minutesOf(w.duration), 0),
  }
})

async function loadWorkouts() {
  loading.value = true
  try {
    const res = await api.get('/workouts/getMyWorkouts')
    workouts.value = res.data.workouts || []
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    loading.value = false
  }
}

function startEdit(workout) {
  editingId.value = workout._id
  // Editing always happens in minutes, whatever unit the row was saved with.
  editName.value = workout.name
  editDuration.value = String(minutesOf(workout.duration))
}

function cancelEdit() {
  editingId.value = ''
  editName.value = ''
  editDuration.value = ''
}

async function saveEdit(workout) {
  busyId.value = workout._id
  try {
    await api.put(`/workouts/updateWorkout/${workout._id}`, {
      name: editName.value,
      // Saved back in minutes so every edit uses one unit.
      duration: `${editDuration.value} mins`,
    })
    cancelEdit()
    await loadWorkouts()
    notyf.success('Workout updated.')
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    busyId.value = ''
  }
}

async function complete(workout) {
  busyId.value = workout._id
  try {
    await api.patch(`/workouts/completeWorkoutStatus/${workout._id}`)
    await loadWorkouts()
    notyf.success(`"${workout.name}" marked as completed.`)
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    busyId.value = ''
  }
}

async function remove(workout) {
  if (!window.confirm(`Delete "${workout.name}"?`)) return
  busyId.value = workout._id
  try {
    await api.delete(`/workouts/deleteWorkout/${workout._id}`)
    await loadWorkouts()
    notyf.success('Workout deleted.')
  } catch (err) {
    notyf.error(apiError(err))
  } finally {
    busyId.value = ''
  }
}

onMounted(() => {
  loadWorkouts()
})
</script>

<template>
  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <div>
      <h1 class="h3 mb-1">My Workouts</h1>
      <p class="text-secondary small mb-0">Everything you've logged so far.</p>
    </div>
    <RouterLink to="/addWorkouts" class="btn btn-primary btn-sm">Add Workout</RouterLink>
  </div>

  <div class="row g-3 mb-4" v-if="workouts.length">
    <div class="col-6 col-md-3" v-for="stat in [
      { label: 'Total', value: stats.total },
      { label: 'Completed', value: stats.completed },
      { label: 'Pending', value: stats.pending },
      { label: 'Minutes logged', value: stats.minutes },
    ]" :key="stat.label">
      <div class="border rounded bg-light p-3">
        <div class="fs-4 fw-semibold">{{ stat.value }}</div>
        <div class="small text-secondary">{{ stat.label }}</div>
      </div>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-body">
      <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
        <input
          v-model="search"
          class="form-control form-control-sm"
          style="max-width: 240px"
          placeholder="Filter by name"
          aria-label="Filter workouts"
        />
        <RouterLink v-if="search" to="/workouts" class="btn btn-sm btn-link p-0">Clear</RouterLink>
      </div>

      <p class="text-secondary mb-0" v-if="loading">Loading...</p>

      <template v-if="!loading">
        <p class="text-secondary mb-0" v-if="workouts.length === 0">
          No workouts yet. <RouterLink to="/addWorkouts">Add one</RouterLink>.
        </p>
        <p class="text-secondary mb-0" v-else-if="visible.length === 0">No matches.</p>

        <div class="table-responsive" v-else>
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Workout</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Added</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="workout in visible" :key="workout._id">
                <template v-if="editingId === workout._id">
                  <td>
                    <input v-model="editName" class="form-control form-control-sm" aria-label="Workout name" />
                  </td>
                  <td style="max-width: 130px">
                    <div class="input-group input-group-sm">
                      <input
                        v-model="editDuration"
                        type="number"
                        min="0"
                        class="form-control"
                        aria-label="Duration in minutes"
                      />
                      <span class="input-group-text">min</span>
                    </div>
                  </td>
                  <td><span class="fw-medium" :class="'status-' + workout.status">{{ workout.status }}</span></td>
                  <td class="small text-secondary">{{ workout.dateAdded || '' }}</td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-1">
                      <button
                        class="btn btn-sm btn-primary"
                        type="button"
                        :disabled="busyId === workout._id"
                        @click="saveEdit(workout)"
                      >
                        Save
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" type="button" @click="cancelEdit">
                        Cancel
                      </button>
                    </div>
                  </td>
                </template>
                <template v-else>
                  <td class="fw-medium">{{ workout.name }}</td>
                  <td>{{ formatDuration(workout.duration) }}</td>
                  <td><span class="fw-medium" :class="'status-' + workout.status">{{ workout.status }}</span></td>
                  <td class="small text-secondary">{{ workout.dateAdded || '' }}</td>
                  <td class="text-end">
                    <div class="d-flex justify-content-end gap-1">
                      <button
                        v-if="workout.status !== 'completed'"
                        class="btn btn-sm btn-outline-success"
                        type="button"
                        :disabled="busyId === workout._id"
                        @click="complete(workout)"
                      >
                        Complete
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" type="button" @click="startEdit(workout)">
                        Edit
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        type="button"
                        :disabled="busyId === workout._id"
                        @click="remove(workout)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>