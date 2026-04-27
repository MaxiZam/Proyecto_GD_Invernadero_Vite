<script setup lang="ts">
// Definimos las "props" para recibir datos desde el padre (App.vue)
defineProps<{
  titulo: string;
  valor: number | string;
  unidad: string;
  alerta?: boolean; // El signo ? indica que es opcional
}>();
</script>

<template>
  <div class="sensor-card" :class="{ 'is-alerta': alerta }">
    <span class="sensor-title">{{ titulo }}</span>
    <div class="sensor-value">
      {{ valor }} <span class="unit">{{ unidad }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos aquí solo afectan a este componente */
.sensor-card {
  background: #222;
  padding: 1rem;
  border-radius: 10px;
  border-left: 4px solid #4ade80;
}
.is-alerta {
  border-left-color: #ff4d4d;
  background: #331a1a;
}
.sensor-title { color: #888; font-size: 0.8rem; }
.sensor-value { font-size: 1.8rem; font-weight: bold; }
.unit { font-size: 1rem; color: #4ade80; }
</style>