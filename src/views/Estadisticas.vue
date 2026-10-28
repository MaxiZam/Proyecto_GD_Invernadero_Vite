<template>
  <div class="dashboard-container">
    <h1 class="titulo">Análisis Agronómico Mensual</h1>

    <div v-if="estado === 'error'" class="alert alert-danger">
      No se pudo obtener la información del backend.
      <button class="btn btn-sm btn-outline-danger ml-2" @click="cargarDatos">Reintentar</button>
    </div>

    <div v-else-if="estado === 'cargando'" class="cargando">
      <p>Cargando datos del gemelo digital...</p>
    </div>

    <div v-else-if="historial.length === 0" class="cargando">
      <p>Aún no hay datos consolidados. El backend guarda un registro por minuto.</p>
    </div>

    <template v-else-if="estadisticas">
      <div class="tarjetas-grid">
        <div class="tarjeta alerta" v-if="estadisticas.diasRiesgoFungico > 0">
          <h3>Riesgo Fúngico</h3>
          <p class="valor">{{ estadisticas.diasRiesgoFungico }} días</p>
          <span class="detalle">Humedad media diaria ≥ 80%</span>
        </div>
        <div class="tarjeta normal" v-else>
          <h3>Riesgo Fúngico</h3>
          <p class="valor">Óptimo</p>
          <span class="detalle">Sin días de riesgo</span>
        </div>

        <div class="tarjeta">
          <h3>Temp. Media</h3>
          <p class="valor">{{ estadisticas.temperaturaMediaMensual.toFixed(1) }} °C</p>
          <span class="detalle">Últimos 30 días</span>
        </div>

        <div class="tarjeta">
          <h3>Pico de Calor</h3>
          <p class="valor">{{ estadisticas.temperaturaMaximaMensual.toFixed(1) }} °C</p>
          <span class="detalle">Máxima registrada</span>
        </div>

        <div class="tarjeta">
          <h3>Mínima</h3>
          <p class="valor">{{ estadisticas.temperaturaMinimaMensual.toFixed(1) }} °C</p>
          <span class="detalle">Mínima registrada</span>
        </div>

        <div class="tarjeta">
          <h3>Humedad Aire</h3>
          <p class="valor">{{ estadisticas.humedadAireMediaMensual.toFixed(1) }} %</p>
          <span class="detalle">Promedio</span>
        </div>

        <div class="tarjeta">
          <h3>Humedad Suelo</h3>
          <p class="valor">{{ estadisticas.humedadSueloMediaMensual.toFixed(1) }} %</p>
          <span class="detalle">Promedio</span>
        </div>

        <div class="tarjeta">
          <h3>Luminosidad Media</h3>
          <p class="valor">{{ Math.round(estadisticas.luminosidadMediaMensual) }} lux</p>
          <span class="detalle">Promedio</span>
        </div>
      </div>

      <div class="graficos-grid">
        <div class="grafico-card">
          <h3>Evolución Climática (Últimos 30 días)</h3>
          <div class="chart-wrapper">
            <Line :data="chartDataClima" :options="chartOptionsClima" />
          </div>
        </div>

        <div class="grafico-card">
          <h3>Eficiencia de Actuadores (% de Uso)</h3>
          <div class="chart-wrapper">
            <Bar :data="chartDataActuadores" :options="chartOptionsActuadores" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { getJson } from '../services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface Estadisticas {
  temperaturaMediaMensual: number; temperaturaMaximaMensual: number; temperaturaMinimaMensual: number
  humedadSueloMediaMensual: number; humedadAireMediaMensual: number; luminosidadMediaMensual: number
  diasRiesgoFungico: number
  usoPromedioCaloventor: number; usoPromedioHumidificador: number; usoPromedioVentanales: number
  usoPromedioPersianas: number; usoPromedioBomba: number
}
interface Registro {
  fechaHora: string; temperaturaMedia: number; humedadSueloMedia: number; humedadAireMedia: number
}
interface PuntoClima { fechaHora: string; temperatura: number; humedadSuelo: number; humedadAire: number }

const MAX_PUNTOS = 300   // 1 registro por minuto => ~43.000 en 30 días: se promedia por tramos para graficar

const estadisticas = ref<Estadisticas | null>(null)
const historial = ref<Registro[]>([])
const estado = ref<'cargando' | 'ok' | 'error'>('cargando')

const cargarDatos = async () => {
  estado.value = 'cargando'
  try {
    const [stats, hist] = await Promise.all([
      getJson<Estadisticas>('/api/invernadero/estadisticas'),
      getJson<Registro[]>('/api/invernadero/historial')
    ])
    estadisticas.value = stats
    historial.value = hist ?? []
    estado.value = 'ok'
  } catch (e) {
    console.error('Error al conectar con el backend:', e)
    estado.value = 'error'
  }
}

onMounted(cargarDatos)

const redondear = (n: number) => Math.round(n * 100) / 100

const reducir = (datos: Registro[], max: number): PuntoClima[] => {
  const tam = Math.max(1, Math.ceil(datos.length / max))
  const salida: PuntoClima[] = []
  for (let i = 0; i < datos.length; i += tam) {
    const g = datos.slice(i, i + tam)
    const primero = g[0]
    if (!primero) continue
    const prom = (f: (r: Registro) => number) => redondear(g.reduce((s, r) => s + f(r), 0) / g.length)
    salida.push({
      fechaHora: primero.fechaHora,
      temperatura: prom(r => r.temperaturaMedia),
      humedadSuelo: prom(r => r.humedadSueloMedia),
      humedadAire: prom(r => r.humedadAireMedia)
    })
  }
  return salida
}

const puntos = computed(() => reducir(historial.value, MAX_PUNTOS))

const etiqueta = (f: string) =>
  new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

// Gráfico de líneas (sensores)
const chartDataClima = computed<ChartData<'line'>>(() => ({
  labels: puntos.value.map(p => etiqueta(p.fechaHora)),
  datasets: [
    { label: 'Temperatura (°C)', borderColor: 'rgb(255,99,132)', backgroundColor: 'rgba(255,99,132,.2)',
      data: puntos.value.map(p => p.temperatura), tension: .4, yAxisID: 'y', pointRadius: 0 },
    { label: 'Humedad suelo (%)', borderColor: 'rgb(54,162,235)', backgroundColor: 'rgba(54,162,235,.2)',
      data: puntos.value.map(p => p.humedadSuelo), tension: .4, yAxisID: 'y1', pointRadius: 0 },
    { label: 'Humedad aire (%)', borderColor: 'rgb(75,192,192)', backgroundColor: 'rgba(75,192,192,.2)',
      data: puntos.value.map(p => p.humedadAire), tension: .4, yAxisID: 'y1', pointRadius: 0 }
  ]
}))

const chartOptionsClima: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Temperatura (°C)' } },
    y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Humedad (%)' },
          grid: { drawOnChartArea: false } }
  }
}

// Gráfico de barras (actuadores)
const chartDataActuadores = computed<ChartData<'bar'>>(() => {
  const e = estadisticas.value
  return {
    labels: ['Caloventor', 'Humidificador', 'Ventanales', 'Persianas', 'Bomba'],
    datasets: [{
      label: '% de tiempo activo',
      backgroundColor: ['rgba(255,159,64,.7)', 'rgba(153,102,255,.7)', 'rgba(75,192,192,.7)',
                        'rgba(255,205,86,.7)', 'rgba(54,162,235,.7)'],
      data: e ? [e.usoPromedioCaloventor, e.usoPromedioHumidificador, e.usoPromedioVentanales,
                 e.usoPromedioPersianas, e.usoPromedioBomba] : []
    }]
  }
})

const chartOptionsActuadores: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentaje (%)' } } }
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  color: #2c3e50;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.tarjeta {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  text-align: center;
  border-left: 5px solid #42b983;
  transition: transform 0.2s;
}

.tarjeta:hover {
  transform: translateY(-5px);
}

.tarjeta.alerta {
  border-left-color: #e74c3c;
  background-color: #fdf5f4;
}

.tarjeta h3 {
  margin: 0;
  font-size: 1rem;
  color: #7f8c8d;
}

.tarjeta .valor {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0.5rem 0;
}

.tarjeta .detalle {
  font-size: 0.85rem;
  color: #95a5a6;
}

.graficos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .graficos-grid {
    grid-template-columns: 1fr;
  }
}

.grafico-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.grafico-card h3 {
  margin-top: 0;
  color: #34495e;
  text-align: center;
  margin-bottom: 1.5rem;
}

.chart-wrapper {
  position: relative;
  height: 350px;
  width: 100%;
}

.cargando {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 3rem;
}
</style>