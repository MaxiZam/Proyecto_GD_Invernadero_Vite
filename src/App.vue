<template>
  <div class="wrapper">
    <nav class="main-header navbar navbar-expand-md navbar-white navbar-light border-bottom-0 shadow-sm">
      <div class="container-fluid">

        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <i class="fas fa-leaf text-success mr-2"></i>
          <span class="brand-text font-weight-bold text-success">Control GD Invernadero</span>
        </router-link>

        <button class="navbar-toggler order-1" type="button" @click="isMenuOpen = !isMenuOpen">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse order-3" :class="{ show: isMenuOpen }">
          <ul class="navbar-nav ml-4" @click="isMenuOpen = false">
            <li v-for="e in ENLACES" :key="e.ruta" class="nav-item">
              <router-link :to="e.ruta" class="nav-link font-weight-bold" active-class="active">
                <i :class="['fas', e.icono, 'mr-1']"></i> {{ e.texto }}
                <span v-if="e.ruta === '/notificaciones' && alertas.length" class="badge badge-danger ml-1">
                  {{ alertas.length }}
                </span>
              </router-link>
            </li>
          </ul>

          <span class="navbar-text ml-auto small font-weight-bold" :class="conectado ? 'text-success' : 'text-danger'">
            <i class="fas fa-circle mr-1"></i>{{ conectado ? 'Conectado' : 'Sin conexión' }}
          </span>
        </div>

      </div>
    </nav>

    <div class="content-wrapper bg-light">
      <div class="content pt-4">
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { conectar, useInvernadero } from './composables/useInvernadero'

const ENLACES = [
  { ruta: '/modelo-3d', icono: 'fa-cube', texto: 'Modelo 3D y Monitoreo' },
  { ruta: '/estadisticas', icono: 'fa-chart-pie', texto: 'Estadísticas' },
  { ruta: '/historial', icono: 'fa-database', texto: 'Historial' },
  { ruta: '/control', icono: 'fa-toggle-on', texto: 'Control' },
  { ruta: '/umbrales', icono: 'fa-sliders', texto: 'Umbrales' },
  { ruta: '/notificaciones', icono: 'fa-bell', texto: 'Notificaciones' }
]

const isMenuOpen = ref(false)
const { alertas, conectado } = useInvernadero()

onMounted(() => {
  document.body.classList.remove('sidebar-mini', 'layout-fixed')
  document.body.classList.add('hold-transition', 'layout-top-nav')
  conectar() // única conexión WebSocket de toda la aplicación
})
</script>

<style>
/* Estilos Globales */
:root {
  --primary-green: #2ecc71;
  --dark-green: #27ae60;
  padding-bottom: 25px;
}

.bg-success {
  background-color: var(--primary-green) !important;
  color: white !important;
}

.text-success {
  color: var(--dark-green) !important;
}

.border-success {
  border-color: var(--primary-green) !important;
}

/* barra superior */
.navbar-light .navbar-nav .nav-link.active {
  color: var(--dark-green) !important;
  border-bottom: 3px solid var(--primary-green);
  padding-bottom: 5px;
}

.navbar-light .navbar-nav .nav-link:hover {
  color: var(--primary-green) !important;
}

body {
  overflow-x: hidden;
}

/* canvas 3D */
canvas {
  display: block;
  outline: none;
  width: 100% !important;
  height: 100% !important;
}
</style>