<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { COLOR } from '../../services/chart'

const props = defineProps<{
  titulo: string
  unidad: string
  valor: number
  min: number                // umbral mínimo de operación
  max: number                // umbral máximo de operación
  escalaMin: number          // extremos del medidor
  escalaMax: number
  decimales?: number
  sinDatos?: boolean
  ignorarMin?: boolean       // p. ej. la luz mínima no aplica de noche
}>()

const bajo = computed(() => props.valor < props.min)
const alto = computed(() => props.valor > props.max)
const enRango = computed(() => !alto.value && (!bajo.value || !!props.ignorarMin))

const fraccion = computed(() => {
  const f = (props.valor - props.escalaMin) / (props.escalaMax - props.escalaMin)
  return Math.min(1, Math.max(0, f))
})

const color = computed(() => (props.sinDatos ? '#bdc3c7' : enRango.value ? COLOR.ok : COLOR.alerta))
const texto = computed(() => (props.sinDatos ? '--' : props.valor.toFixed(props.decimales ?? 1)))
const estado = computed(() => {
  if (props.sinDatos) return { texto: 'Sin datos', clase: 'badge-secondary' }
  if (alto.value) return { texto: 'Alto', clase: 'badge-warning' }
  if (bajo.value) return props.ignorarMin
    ? { texto: 'Noche', clase: 'badge-dark' }
    : { texto: 'Bajo', clase: 'badge-warning' }
  return { texto: 'En rango', clase: 'badge-success' }
})

const data = computed<ChartData<'doughnut'>>(() => ({
  labels: [props.titulo, 'Resto'],
  datasets: [{
    data: [fraccion.value, 1 - fraccion.value],
    backgroundColor: [color.value, COLOR.gris],
    borderWidth: 0
  }]
}))

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  rotation: -90,
  circumference: 180,
  cutout: '72%',
  animation: { duration: 400 },
  plugins: { legend: { display: false }, tooltip: { enabled: false } }
}
</script>

<template>
  <div class="card card-outline card-success shadow-sm h-100">
    <div class="card-body text-center p-3">
      <div class="gauge-titulo font-weight-bold">{{ titulo }}</div>
      <div class="gauge-canvas">
        <Doughnut :data="data" :options="options" />
        <div class="gauge-valor" :style="{ color }">
          {{ texto }}<small v-if="!sinDatos"> {{ unidad }}</small>
        </div>
      </div>
      <div class="small text-muted mt-1">Rango óptimo: {{ min }} – {{ max }} {{ unidad }}</div>
      <span class="badge mt-1" :class="estado.clase">{{ estado.texto }}</span>
    </div>
  </div>
</template>

<style scoped>
.gauge-titulo { color: #34495e; margin-bottom: .25rem; }
.gauge-canvas { position: relative; height: 110px; }
.gauge-valor {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}
.gauge-valor small { font-size: .8rem; font-weight: 600; }
</style>