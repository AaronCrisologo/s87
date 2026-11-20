import axios from 'axios'
import { ref } from 'vue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
})

// The API expects a Bearer token on every protected route.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const token = ref(localStorage.getItem('token') || '')
export const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'))

export function setSession(data) {
  token.value = data.token
  currentUser.value = data.user
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))
}

export function clearSession() {
  token.value = ''
  currentUser.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Turns an axios / network failure into one readable line.
export function apiError(err) {
  const data = err?.response?.data
  if (data?.error) return data.error
  if (data?.message) return data.message
  return err?.message || 'Something went wrong'
}

export default api