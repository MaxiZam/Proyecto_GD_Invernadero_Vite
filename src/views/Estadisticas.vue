<template>
  <div class="contenedor-estadisticas">
    <h1 class="titulo">Gráficos y Estadísticas</h1>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link font-weight-bold" :class="{ active: pestana === 'sensores' }" href="#"
           @click.prevent="pestana = 'sensores'">
          <i class="fas fa-satellite-dish mr-1"></i> Sensores en tiempo real
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link font-weight-bold" :class="{ active: pestana === 'derivados' }" href="#"
           @click.prevent="pestana = 'derivados'">
          <i class="fas fa-chart-pie mr-1"></i> Datos derivados
        </a>
      </li>
    </ul>

    <PanelSensores v-show="pestana === 'sensores'" />
    <PanelDerivados v-if="pestana === 'derivados'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PanelSensores from '../components/estadisticas/PanelSensores.vue'
import PanelDerivados from '../components/estadisticas/PanelDerivados.vue'

const pestana = ref<'sensores' | 'derivados'>('sensores')
</script>

<style scoped>
.contenedor-estadisticas {
  padding: 1rem 2rem 2rem;
  max-width: 1300px;
  margin: 0 auto;
}
.titulo {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}
</style>