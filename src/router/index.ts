import { createRouter, createWebHistory } from 'vue-router'
import Modelo3D from '../views/Modelo3D.vue'
import Camara from '../views/Camara.vue'
import Inicio from '../views/Inicio.vue'
import Estadisticas from '../views/Estadisticas.vue'
import Historial from '../views/Historial.vue'
import Notificaciones from '../views/Notificaciones.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'inicio', component: Inicio },
    { path: '/modelo-3d', name: 'modelo-3d', component: Modelo3D },
    { path: '/estadisticas', name: 'estadisticas', component: Estadisticas },
    { path: '/camara', name: 'camara', component: Camara },
    { path: '/historial', name: 'historial', component: Historial },
    { path: '/notificaciones', name: 'notificaciones', component: Notificaciones }
  ]
})

export default router