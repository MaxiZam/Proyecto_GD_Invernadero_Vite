<template>
  <div class="card card-danger card-outline shadow-sm mt-4">
    <div class="card-header bg-white">
      <h3 class="card-title font-weight-bold text-danger">
        <i class="fas fa-bell mr-2"></i> Panel de Alertas en Tiempo Real
      </h3>
      <div class="card-tools">
        <span class="badge badge-danger mr-2">{{ alertas.length }} alertas</span>
        <button v-if="alertas.length" class="btn btn-sm btn-outline-secondary" @click="limpiarAlertas">
          <i class="fas fa-trash mr-1"></i> Limpiar todo
        </button>
      </div>
    </div>

    <div class="card-body" style="max-height: 480px; overflow-y: auto;">

      <div v-if="!conectado" class="alert alert-warning">
        <i class="fas fa-plug mr-2"></i> Sin conexión con el backend: las alertas nuevas no llegarán hasta reconectar.
      </div>

      <div v-if="alertas.length === 0" class="text-center text-muted py-4">
        <i class="fas fa-check-circle fa-3x mb-3 text-success"></i>
        <h5>Sistema operando con normalidad</h5>
        <p>No se han detectado anomalías ni umbrales excedidos.</p>
      </div>

      <TransitionGroup name="list" tag="div">
        <div
          v-for="a in alertas"
          :key="a.id"
          :class="['alert', 'alert-dismissible', 'shadow-sm', obtenerClaseAlerta(a.severidad)]"
        >
          <button type="button" class="close" @click="descartarAlerta(a.id)">&times;</button>

          <h5 class="font-weight-bold">
            <i :class="['mr-2', obtenerIconoAlerta(a.tipo)]"></i>
            {{ a.componente }}
          </h5>

          <p class="mb-1">{{ a.mensaje }}</p>

          <div class="text-right text-sm mt-2 opacity-75">
            <i class="far fa-clock mr-1"></i> {{ formatearHora(a.timestamp) }}
            <span class="ml-2 badge bg-white text-dark border">{{ a.tipo }}</span>
          </div>
        </div>
      </TransitionGroup>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useInvernadero } from '../composables/useInvernadero'

const { alertas, conectado, descartarAlerta, limpiarAlertas } = useInvernadero()

const obtenerClaseAlerta = (severidad: string) => {
  if (severidad === 'CRITICO') return 'alert-danger'
  if (severidad === 'ADVERTENCIA') return 'alert-warning'
  return 'alert-info'
}

const obtenerIconoAlerta = (tipo: string) => {
  if (tipo === 'HARDWARE') return 'fas fa-tools'
  if (tipo === 'ANOMALIA') return 'fas fa-exclamation-triangle'
  if (tipo === 'UMBRAL') return 'fas fa-thermometer-full'
  return 'fas fa-info-circle'
}

const formatearHora = (fechaIso: string) => {
  const fecha = new Date(fechaIso)
  if (!fechaIso || isNaN(fecha.getTime())) return 'Hora desconocida'
  return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
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