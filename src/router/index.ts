import { createRouter, createWebHistory } from 'vue-router'
import Inicio from '../views/Inicio.vue'

// Las vistas pesadas (Three.js, Chart.js) se cargan solo al entrar
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: Inicio },
    { path: '/modelo-3d', name: 'modelo-3d', component: () => import('../views/Modelo3D.vue') },
    { path: '/estadisticas', name: 'estadisticas', component: () => import('../views/Estadisticas.vue') },
    { path: '/historial', name: 'historial', component: () => import('../views/Historial.vue') },
    { path: '/notificaciones', name: 'notificaciones', component: () => import('../views/Notificaciones.vue') },
    { path: '/control', name: 'control', component: () => import('../views/Control.vue') },
    { path: '/umbrales', name: 'umbrales', component: () => import('../views/Umbrales.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

export default router