import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.vue'
import { token } from './api'
import './assets/main.css'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/register' },
    { path: '/register', name: 'register', component: () => import('./pages/RegisterPage.vue') },
    { path: '/login', name: 'login', component: () => import('./pages/LoginPage.vue') },
    { path: '/workouts', name: 'workouts', component: () => import('./pages/WorkoutsPage.vue') },
    { path: '/addWorkouts', name: 'addWorkouts', component: () => import('./pages/AddWorkoutsPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/register' },
  ],
})

// Routes that only make sense while logged out.
const AUTH_PAGES = ['login', 'register']

router.beforeEach((to) => {
  const loggedIn = Boolean(token.value)

  // Logged in and heading for the auth pages (or "/"): send them to their workouts.
  if (loggedIn && (AUTH_PAGES.includes(to.name) || to.path === '/')) {
    return { name: 'workouts' }
  }

  // Workouts are private: without a token, send the user to the login page.
  if (!loggedIn && (to.name === 'workouts' || to.name === 'addWorkouts')) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

// One toast instance shared by every page.
export const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'bottom' },
  dismissible: true,
  types: [
    { type: 'success', background: '#198754', icon: { className: 'check', tagName: 'i' } },
    { type: 'error', background: '#dc3545', icon: { className: 'cross', tagName: 'i' } },
  ],
})

createApp(App).use(router).mount('#app')