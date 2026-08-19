<template>
  <div class="wrapper">
    <!-- Navbar Superior -->
    <nav class="main-header navbar navbar-expand-md navbar-white navbar-light border-bottom-0 shadow-sm">
      <div class="container-fluid">
        
        <!-- Logo y Título -->
        <a href="#" class="navbar-brand d-flex align-items-center">
          <i class="fas fa-leaf text-success mr-2"></i>
          <span class="brand-text font-weight-bold text-success">Control GD Invernadero</span>
        </a>

        <!-- Botón de menú para móviles -->
        <button class="navbar-toggler order-1" type="button" @click="toggleMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Enlaces del menú superior -->
        <div class="collapse navbar-collapse order-3" :class="{ 'show': isMenuOpen }">
          <ul class="navbar-nav ml-4">
            
            <li class="nav-item">
              <router-link to="/modelo-3d" class="nav-link font-weight-bold" active-class="active">
                <i class="fas fa-cube mr-1"></i> Modelo 3D y Monitoreo
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/estadisticas" class="nav-link font-weight-bold" active-class="active">
                <i class="fas fa-cube mr-1"></i> Estadísticas
              </router-link>
            </li>
            
            <li class="nav-item">
              <router-link to='/historial' class="nav-link font-weight-bold" active-class="active">
                <i class="fas fa-chart-line mr-1"></i> Historial de Datos
              </router-link>
            </li>
            
          </ul>
        </div>

      </div>
    </nav>

    <!-- Contenido Principal -->
    <div class="content-wrapper bg-light">
      <!-- Se eliminó el content-header fijo para que cada vista tenga el suyo -->

      <div class="content pt-4"> <!-- Añadí un pt-4 para dar un poco de margen superior -->
        <div class="container-fluid">
          
          <!-- AQUÍ SE INYECTA LA VISTA MÁGICAMENTE -->
          <router-view></router-view>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import Estadisticas from './views/Estadisticas.vue'
import Modelo3D from './views/Modelo3D.vue'

// Estado reactivo
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

onMounted(() => {
  document.body.classList.remove('sidebar-mini', 'layout-fixed')
  document.body.classList.add('hold-transition', 'layout-top-nav')
  
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 500)
})
</script>

<style>
/* Estilos Globales (Colores Base) */
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

/* Rediseñamos el estilo del ítem activo para la barra superior */
.navbar-light .navbar-nav .nav-link.active {
  color: var(--dark-green) !important;
  border-bottom: 3px solid var(--primary-green);
  padding-bottom: 5px;
}

.navbar-light .navbar-nav .nav-link:hover {
  color: var(--primary-green) !important;
}

/* Evita barra de desplazamiento horizontal y ajusta layout */
body {
  overflow-x: hidden;
}

/* Configuración global para el canvas 3D */
canvas {
  display: block;
  outline: none;
  width: 100% !important;
  height: 100% !important;
}
</style>