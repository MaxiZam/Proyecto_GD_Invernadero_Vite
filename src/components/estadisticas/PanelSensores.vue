<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import GaugeSensor from './GaugeSensor.vue'
import { COLOR, alfa } from '../../services/chart'
import { getJson } from '../../services/api'
import { useInvernadero } from '../../composables/useInvernadero'
import type { MuestraViva } from '../../composables/useInvernadero'

interface Umbrales {
  tempMin: number; tempMax: number
  humSueloMin: number; humSueloMax: number
  humAireMin: number; humAireMax: number
  luzMin: number; luzMax: number
}

const { telemetria, muestras, sinDatos } = useInvernadero()

const umbrales = ref<Umbrales>({
  tempMin: 18, tempMax: 28, humSueloMin: 50, humSueloMax: 80, humAireMin: 50, humAireMax: 75, luzMin: 400, luzMax: 900
})

onMounted(async () => {
  try {
    umbrales.value = await getJson<Umbrales>('/api/umbrales')
  } catch (e) {
    console.error('No se pudieron cargar los umbrales; se usan los valores por defecto', e)
  }
})

// --- Actuadores ---------------------------------------------------------------------------
const actuadores = computed(() => [
  { nombre: 'Caloventor', activo: telemetria.caloventorActivo, on: 'ON', off: 'OFF' },
  { nombre: 'Humidificador', activo: telemetria.humidificadorActivo, on: 'ON', off: 'OFF' },
  { nombre: 'Ventanales', activo: telemetria.ventanalesAbiertos, on: 'ABIERTOS', off: 'CERRADOS' },
  { nombre: 'Persianas', activo: telemetria.persianasEnrolladas, on: 'ENROLLADAS', off: 'DESENROLLADAS' },
  { nombre: 'Bomba de agua', activo: telemetria.bombaActiva, on: 'ACTIVA', off: 'INACTIVA' }
])

// --- Resumen de la ventana en vivo --------------------------------------------------------
const resumen = (f: (m: MuestraViva) => number) => {
  const v = muestras.value.map(f)
  const n = v.length
  return {
    n,
    min: n ? Math.min(...v) : 0,
    max: n ? Math.max(...v) : 0,
    media: n ? v.reduce((a, b) => a + b, 0) / n : 0
  }
}

const filasResumen = computed(() => [
  { nombre: 'Temperatura', unidad: '°C', dec: 1, r: resumen(m => m.temperatura) },
  { nombre: 'Humedad del aire', unidad: '%', dec: 1, r: resumen(m => m.humedadAire) },
  { nombre: 'Humedad del suelo', unidad: '%', dec: 1, r: resumen(m => m.humedadSuelo) },
  { nombre: 'Luminosidad', unidad: 'lux', dec: 0, r: resumen(m => m.luminosidad) }
])

// --- Gráficas en vivo ---------------------------------------------------------------------
const etiquetas = computed(() => muestras.value.map(m => new Date(m.t).toLocaleTimeString('es-AR')))

const dataClima = computed<ChartData<'line'>>(() => ({
  labels: etiquetas.value,
  datasets: [
    { label: 'Temperatura (°C)', data: muestras.value.map(m => m.temperatura), yAxisID: 'y',
      borderColor: COLOR.temperatura, backgroundColor: alfa(COLOR.temperatura, 0.15),
      pointRadius: 0, tension: 0.3, borderWidth: 2 },
    { label: 'Humedad aire (%)', data: muestras.value.map(m => m.humedadAire), yAxisID: 'y1',
      borderColor: COLOR.humedadAire, backgroundColor: alfa(COLOR.humedadAire, 0.15),
      pointRadius: 0, tension: 0.3, borderWidth: 2 },
    { label: 'Humedad suelo (%)', data: muestras.value.map(m => m.humedadSuelo), yAxisID: 'y1',
      borderColor: COLOR.humedadSuelo, backgroundColor: alfa(COLOR.humedadSuelo, 0.15),
      pointRadius: 0, tension: 0.3, borderWidth: 2 }
  ]
}))

const opcionesClima: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: { ticks: { maxTicksLimit: 8, maxRotation: 0 } },
    y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperatura (°C)' } },
    y1: { type: 'linear', position: 'right', min: 0, max: 100,
          title: { display: true, text: 'Humedad (%)' }, grid: { drawOnChartArea: false } }
  }
}

const dataLuz = computed<ChartData<'line'>>(() => ({
  labels: etiquetas.value,
  datasets: [
    { label: 'Luminosidad (lux)', data: muestras.value.map(m => m.luminosidad),
      borderColor: COLOR.luminosidad, backgroundColor: alfa(COLOR.luminosidad, 0.25),
      fill: true, pointRadius: 0, tension: 0.3, borderWidth: 2 }
  ]
}))

const opcionesLuz: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { maxTicksLimit: 8, maxRotation: 0 } },
    y: { beginAtZero: true, title: { display: true, text: 'lux' } }
  }
}
</script>

<template>
  <div>
    <div v-if="sinDatos" class="alert alert-warning shadow-sm">
      <i class="fas fa-plug mr-2"></i>
      Sin datos en tiempo real. Verifica que el backend y el simulador estén en ejecución.
    </div>

    <!-- Valores actuales -->
    <div class="row">
      <div class="col-6 col-lg-3 mb-3">
        <GaugeSensor titulo="Temperatura" unidad="°C" :valor="telemetria.temperatura"
                     :min="umbrales.tempMin" :max="umbrales.tempMax"
                     :escala-min="0" :escala-max="40" :sin-datos="sinDatos" />
      </div>
      <div class="col-6 col-lg-3 mb-3">
        <GaugeSensor titulo="Humedad del aire" unidad="%" :valor="telemetria.humedadAire"
                     :min="umbrales.humAireMin" :max="umbrales.humAireMax"
                     :escala-min="0" :escala-max="100" :sin-datos="sinDatos" />
      </div>
      <div class="col-6 col-lg-3 mb-3">
        <GaugeSensor titulo="Humedad del suelo" unidad="%" :valor="telemetria.humedadSuelo"
                     :min="umbrales.humSueloMin" :max="umbrales.humSueloMax"
                     :escala-min="0" :escala-max="100" :sin-datos="sinDatos" />
      </div>
      <div class="col-6 col-lg-3 mb-3">
        <GaugeSensor titulo="Luminosidad" unidad="lux" :valor="telemetria.luminosidad"
                     :min="umbrales.luzMin" :max="umbrales.luzMax" :decimales="0"
                     :escala-min="0" :escala-max="1200" :sin-datos="sinDatos"
                     :ignorar-min="!telemetria.esDeDia" />
      </div>
    </div>

    <!-- Tendencia en vivo -->
    <div class="row">
      <div class="col-lg-8 mb-3">
        <div class="card card-outline card-success shadow-sm h-100">
          <div class="card-header bg-white">
            <h3 class="card-title font-weight-bold">Clima en vivo (últimos minutos)</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper"><Line :data="dataClima" :options="opcionesClima" /></div>
          </div>
        </div>
      </div>
      <div class="col-lg-4 mb-3">
        <div class="card card-outline card-success shadow-sm h-100">
          <div class="card-header bg-white">
            <h3 class="card-title font-weight-bold">Luminosidad en vivo</h3>
          </div>
          <div class="card-body">
            <div class="chart-wrapper"><Line :data="dataLuz" :options="opcionesLuz" /></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de la ventana + actuadores -->
    <div class="row">
      <div class="col-lg-7 mb-3">
        <div class="card card-outline card-success shadow-sm h-100">
          <div class="card-header bg-white">
            <h3 class="card-title font-weight-bold">Resumen de la ventana en vivo</h3>
            <div class="card-tools small text-muted">{{ muestras.length }} muestras</div>
          </div>
          <div class="card-body p-0">
            <table class="table table-sm mb-0 text-center">
              <thead>
                <tr><th class="text-left pl-3">Sensor</th><th>Mínimo</th><th>Media</th><th>Máximo</th></tr>
              </thead>
              <tbody>
                <tr v-for="f in filasResumen" :key="f.nombre">
                  <td class="text-left pl-3">{{ f.nombre }}</td>
                  <td>{{ f.r.n ? f.r.min.toFixed(f.dec) : '--' }} {{ f.unidad }}</td>
                  <td>{{ f.r.n ? f.r.media.toFixed(f.dec) : '--' }} {{ f.unidad }}</td>
                  <td>{{ f.r.n ? f.r.max.toFixed(f.dec) : '--' }} {{ f.unidad }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-5 mb-3">
        <div class="card card-outline card-success shadow-sm h-100">
          <div class="card-header bg-white">
            <h3 class="card-title font-weight-bold">Estado de los actuadores</h3>
            <div class="card-tools">
              <span v-if="!sinDatos" class="badge" :class="telemetria.esDeDia ? 'badge-warning' : 'badge-dark'">
                <i :class="['fas', telemetria.esDeDia ? 'fa-sun' : 'fa-moon', 'mr-1']"></i>
                {{ telemetria.esDeDia ? 'Día' : 'Noche' }}
              </span>
            </div>
          </div>
          <ul class="list-group list-group-flush">
            <li v-for="a in actuadores" :key="a.nombre"
                class="list-group-item d-flex justify-content-between align-items-center py-2">
              {{ a.nombre }}
              <span class="badge" :class="sinDatos ? 'bg-secondary' : (a.activo ? 'bg-success' : 'bg-secondary')">
                {{ sinDatos ? '--' : (a.activo ? a.on : a.off) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>