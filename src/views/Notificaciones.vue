<template>
  <div class="card card-danger card-outline shadow-sm mt-4">
    <div class="card-header bg-white">
      <h3 class="card-title font-weight-bold text-danger">
        <i class="fas fa-bell mr-2"></i> Panel de Alertas en Tiempo Real
      </h3>
      <div class="card-tools">
        <span class="badge badge-danger">{{ alertas.length }} Alertas activas</span>
      </div>
    </div>
    
    <div class="card-body" style="max-height: 400px; overflow-y: auto;">
      
      <!-- Mensaje por defecto si no hay alertas -->
      <div v-if="alertas.length === 0" class="text-center text-muted py-4">
        <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
        <h5>Sistema operando con normalidad</h5>
        <p>No se han detectado anomalías ni umbrales excedidos.</p>
      </div>

      <!-- Iteracion de las alertas recibidas por WebSockets -->
      <TransitionGroup name="list" tag="div">
        <div 
          v-for="(alerta, index) in alertas.slice().reverse()" 
          :key="index" 
          :class="['alert', 'alert-dismissible', 'shadow-sm', obtenerClaseAlerta(alerta.severidad)]"
        >
          <button type="button" class="close" @click="descartarAlerta(index)" aria-hidden="true">&times;</button>
          
          <h5 class="font-weight-bold">
            <i :class="['mr-2', obtenerIconoAlerta(alerta.tipo)]"></i> 
            {{ alerta.componente }}
          </h5>
          
          <p class="mb-1">{{ alerta.mensaje }}</p>
          
          <div class="text-right text-sm mt-2 opacity-75">
            <i class="far fa-clock mr-1"></i> {{ formatearHora(alerta.timestamp) }}
            <span class="ml-2 badge bg-white text-dark border">{{ alerta.tipo }}</span>
          </div>
        </div>
      </TransitionGroup>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

interface AlertaDTO {
  tipo: string;
  componente: string;
  mensaje: string;
  severidad: string;
  timestamp: string; 
}

const alertas = ref<AlertaDTO[]>([]);

onMounted(() => {
  const socket = new SockJS('http://localhost:8080/ws-invernadero');
  const stompClient = Stomp.over(socket);

  stompClient.debug = () => {};

  stompClient.connect({}, (frame: any) => {
    stompClient.subscribe('/topic/alertas', (mensaje: any) => {
      const nuevaAlerta = JSON.parse(mensaje.body) as AlertaDTO;
      alertas.value.push(nuevaAlerta);
    });
  });
});

// --- FUNCIONES PARA EL RENDERIZADO DINÁMICO ---
const obtenerClaseAlerta = (severidad: string) => {
  if (severidad === 'CRITICO') return 'alert-danger';
  if (severidad === 'ADVERTENCIA') return 'alert-warning';
  return 'alert-info';
};

const obtenerIconoAlerta = (tipo: string) => {
  if (tipo === 'HARDWARE') return 'fas fa-tools';
  if (tipo === 'ANOMALIA') return 'fas fa-exclamation-triangle';
  if (tipo === 'UMBRAL') return 'fas fa-thermometer-full';
  return 'fas fa-info-circle';
};

const formatearHora = (fechaIso: string) => {
  if (!fechaIso) return 'Hora desconocida';
  const fecha = new Date(fechaIso);
  return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const descartarAlerta = (index: number) => {
  const indiceReal = alertas.value.length - 1 - index;
  alertas.value.splice(indiceReal, 1);
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>