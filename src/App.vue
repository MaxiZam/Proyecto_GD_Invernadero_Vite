<template>
  <div class="wrapper">
    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand-md navbar-white navbar-light border-bottom-0 shadow-sm">
      <div class="container-fluid">
        
        <!-- Logo y titulo -->
        <a href="/" class="navbar-brand d-flex align-items-center">
          <i class="fas fa-leaf text-success mr-2"></i>
          <span class="brand-text font-weight-bold text-success">Control GD Invernadero</span>
        </a>

        <button class="navbar-toggler order-1" type="button" @click="toggleMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Enlaces del menu superior -->
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

            <li class="nav-item">
              <router-link to='/notificaciones' class="nav-link font-weight-bold" active-class="active">
                <i class="fas fa-chart-line mr-1"></i> Notificaciones
              </router-link>
            </li>
            
          </ul>
        </div>

      </div>
    </nav>

    <!-- Seccion Principal -->
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
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

interface AlertaDTO {
  tipo: string;
  componente: string;
  mensaje: string;
  severidad: string;
  timestamp: string; 
}

const alertas = ref<AlertaDTO[]>([]);

onMounted(() => {
  document.body.classList.remove('sidebar-mini', 'layout-fixed')
  document.body.classList.add('hold-transition', 'layout-top-nav')
  
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'))
  }, 500)

  // Coneccion con socket de alertas
  const socket = new SockJS('http://localhost:8080/ws-invernadero');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, (frame: any) => {
    console.log('Conectado a WebSockets: ' + frame);

    stompClient.subscribe('/topic/alertas', (mensaje: any) => {
      const nuevaAlerta = JSON.parse(mensaje.body) as AlertaDTO;
      alertas.value.push(nuevaAlerta);
      console.log("¡Nueva Alerta recibida!", nuevaAlerta);
    });
  });
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