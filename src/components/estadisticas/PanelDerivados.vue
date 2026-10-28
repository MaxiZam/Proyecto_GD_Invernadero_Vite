<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bar, Line, Pie, Radar, Scatter } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { COLOR, alfa } from '../../services/chart'
import { getJson } from '../../services/api'

interface Estadisticas {
  temperaturaMediaMensual: number; temperaturaMaximaMensual: number; temperaturaMinimaMensual: number
  humedadSueloMediaMensual: number; humedadAireMediaMensual: number; luminosidadMediaMensual: number
  diasRiesgoFungico: number
  usoPromedioCaloventor: number; usoPromedioHumidificador: number; usoPromedioVentanales: number
  usoPromedioPersianas: number; usoPromedioBomba: number
  registrosAnalizados: number; horasCubiertas: number
  horasCaloventor: number; horasHumidificador: number; horasVentanales: number
  horasPersianas: number; horasBomba: number
  kwhCaloventor: number; kwhHumidificador: number; kwhBomba: number
  energiaEstimadaKwh: number; aguaEstimadaLitros: number
  enRangoTemperatura: number; enRangoHumedadSuelo: number; enRangoHumedadAire: number
}
interface Diaria {
  fecha: string
  temperaturaMedia: number; temperaturaMin: number; temperaturaMax: number
  humedadSueloMedia: number; humedadAireMedia: number; luminosidadMedia: number
  registros: number
}
interface PuntoSerie {
  fechaHora: string; temperatura: number; humedadSuelo: number; humedadAire: number; luminosidad: number
}
interface Kpi { titulo: string; valor: string; detalle: string; alerta?: boolean }

const estadisticas = ref<Estadisticas | null>(null)
const diarias = ref<Diaria[]>([])
const serie = ref<PuntoSerie[]>([])
const estado = ref<'cargando' | 'ok' | 'error'>('cargando')

const cargar = async () => {
  estado.value = 'cargando'
  try {
    const [stats, dia, ser] = await Promise.all([
      getJson<Estadisticas>('/api/invernadero/estadisticas'),
      getJson<Diaria[]>('/api/invernadero/estadisticas/diarias'),
      getJson<PuntoSerie[]>('/api/invernadero/historial/resumen?puntos=300')
    ])
    estadisticas.value = stats
    diarias.value = dia ?? []
    serie.value = ser ?? []
    estado.value = 'ok'
  } catch (e) {
    console.error('Error al conectar con el backend:', e)
    estado.value = 'error'
  }
}
onMounted(cargar)

// --- Utilidades ---------------------------------------------------------------------------
const etiquetaHora = (f: string) =>
  new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

// 'YYYY-MM-DD' se interpreta como UTC y mostraría el día anterior en Argentina: se fuerza hora local
const etiquetaDia = (f: string) =>
  new Date(f + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })

const promedio = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0)

const pearson = (xs: number[], ys: number[]): number | null => {
  if (xs.length < 3 || xs.length !== ys.length) return null
  const mx = promedio(xs), my = promedio(ys)
  let sxy = 0, sxx = 0, syy = 0
  xs.forEach((x, i) => {
    const dx = x - mx, dy = (ys[i] ?? 0) - my
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy
  })
  const d = Math.sqrt(sxx * syy)
  return d === 0 ? null : sxy / d
}

// --- KPIs ---------------------------------------------------------------------------------
const kpis = computed<Kpi[]>(() => {
  const e = estadisticas.value
  if (!e) return []
  return [
    { titulo: 'Temp. media', valor: `${e.temperaturaMediaMensual.toFixed(1)} °C`, detalle: 'Promedio del período' },
    { titulo: 'Pico de calor', valor: `${e.temperaturaMaximaMensual.toFixed(1)} °C`, detalle: 'Máxima registrada' },
    { titulo: 'Mínima', valor: `${e.temperaturaMinimaMensual.toFixed(1)} °C`, detalle: 'Mínima registrada' },
    { titulo: 'Humedad aire', valor: `${e.humedadAireMediaMensual.toFixed(1)} %`, detalle: 'Promedio' },
    { titulo: 'Humedad suelo', valor: `${e.humedadSueloMediaMensual.toFixed(1)} %`, detalle: 'Promedio' },
    { titulo: 'Luminosidad', valor: `${Math.round(e.luminosidadMediaMensual)} lux`, detalle: 'Promedio' },
    { titulo: 'Energía estimada', valor: `${e.energiaEstimadaKwh.toFixed(2)} kWh`, detalle: 'Caloventor + humidificador + bomba' },
    { titulo: 'Agua estimada', valor: `${e.aguaEstimadaLitros.toFixed(1)} L`, detalle: 'Según el caudal de la bomba' },
    { titulo: 'Período analizado', valor: `${e.horasCubiertas.toFixed(1)} h`, detalle: `${e.registrosAnalizados} registros` },
    e.diasRiesgoFungico > 0
      ? { titulo: 'Riesgo fúngico', valor: `${e.diasRiesgoFungico} días`, detalle: 'Humedad media diaria ≥ 80 %', alerta: true }
      : { titulo: 'Riesgo fúngico', valor: 'Óptimo', detalle: 'Sin días de riesgo' }
  ]
})

// --- 1. Tendencia (serie promediada por el backend) ---------------------------------------
const dataTendencia = computed<ChartData<'line'>>(() => ({
  labels: serie.value.map(p => etiquetaHora(p.fechaHora)),
  datasets: [
    { label: 'Temperatura (°C)', data: serie.value.map(p => p.temperatura), yAxisID: 'y',
      borderColor: COLOR.temperatura, backgroundColor: alfa(COLOR.temperatura, 0.15),
      tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Humedad aire (%)', data: serie.value.map(p => p.humedadAire), yAxisID: 'y1',
      borderColor: COLOR.humedadAire, backgroundColor: alfa(COLOR.humedadAire, 0.15),
      tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Humedad suelo (%)', data: serie.value.map(p => p.humedadSuelo), yAxisID: 'y1',
      borderColor: COLOR.humedadSuelo, backgroundColor: alfa(COLOR.humedadSuelo, 0.15),
      tension: 0.4, pointRadius: 0, borderWidth: 2 }
  ]
}))

const opcionesTendencia: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: { ticks: { maxTicksLimit: 10, maxRotation: 0 } },
    y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperatura (°C)' } },
    y1: { type: 'linear', position: 'right', title: { display: true, text: 'Humedad (%)' },
          grid: { drawOnChartArea: false } }
  }
}

// --- 2. Banda mín–máx diaria de temperatura -----------------------------------------------
const dataBanda = computed<ChartData<'line'>>(() => ({
  labels: diarias.value.map(d => etiquetaDia(d.fecha)),
  datasets: [
    // 'fill: +1' rellena el espacio hasta el dataset siguiente (la mínima)
    { label: 'Máxima (°C)', data: diarias.value.map(d => d.temperaturaMax),
      borderColor: COLOR.temperatura, backgroundColor: alfa(COLOR.temperatura, 0.15),
      fill: '+1', tension: 0.3, pointRadius: 3 },
    { label: 'Mínima (°C)', data: diarias.value.map(d => d.temperaturaMin),
      borderColor: COLOR.humedadSuelo, fill: false, tension: 0.3, pointRadius: 3 },
    { label: 'Media (°C)', data: diarias.value.map(d => d.temperaturaMedia),
      borderColor: '#2c3e50', borderDash: [6, 4], fill: false, tension: 0.3, pointRadius: 0 }
  ]
}))

const opcionesBanda: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: { y: { title: { display: true, text: 'Temperatura (°C)' } } }
}

// --- 3. % de tiempo dentro / fuera de rango -----------------------------------------------
const enRango = computed(() => {
  const e = estadisticas.value
  return e ? [e.enRangoTemperatura, e.enRangoHumedadSuelo, e.enRangoHumedadAire] : [0, 0, 0]
})

const dataRango = computed<ChartData<'bar'>>(() => ({
  labels: ['Temperatura', 'Humedad suelo', 'Humedad aire'],
  datasets: [
    { label: 'En rango', data: enRango.value, backgroundColor: COLOR.ok },
    { label: 'Fuera de rango', data: enRango.value.map(v => Math.round((100 - v) * 100) / 100),
      backgroundColor: COLOR.alerta }
  ]
}))

const opcionesRango: ChartOptions<'bar'> = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true, min: 0, max: 100, ticks: { callback: v => `${v} %` } },
    y: { stacked: true }
  }
}

// --- 4. Pizza: reparto del consumo energético ---------------------------------------------
const energiaTotal = computed(() => estadisticas.value?.energiaEstimadaKwh ?? 0)

const dataEnergia = computed<ChartData<'pie'>>(() => {
  const e = estadisticas.value
  return {
    labels: ['Caloventor', 'Humidificador', 'Bomba'],
    datasets: [{
      data: e ? [e.kwhCaloventor, e.kwhHumidificador, e.kwhBomba] : [],
      backgroundColor: ['rgba(255,159,64,.85)', 'rgba(153,102,255,.85)', 'rgba(54,162,235,.85)'],
      borderWidth: 1
    }]
  }
})

const opcionesEnergia: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: ctx => {
          const kwh = Number(ctx.parsed)
          const pct = energiaTotal.value > 0 ? (kwh / energiaTotal.value) * 100 : 0
          return `${ctx.label}: ${kwh.toFixed(2)} kWh (${pct.toFixed(1)} %)`
        }
      }
    }
  }
}

// --- 5. Radar: perfil de uso de actuadores ------------------------------------------------
const dataRadar = computed<ChartData<'radar'>>(() => {
  const e = estadisticas.value
  return {
    labels: ['Caloventor', 'Humidificador', 'Ventanales (abiertos)', 'Persianas (enrolladas)', 'Bomba'],
    datasets: [{
      label: '% del tiempo activo',
      data: e ? [e.usoPromedioCaloventor, e.usoPromedioHumidificador, e.usoPromedioVentanales,
                 e.usoPromedioPersianas, e.usoPromedioBomba] : [],
      fill: true,
      borderColor: COLOR.ok,
      backgroundColor: alfa('rgb(46, 204, 113)', 0.25),
      pointBackgroundColor: COLOR.ok
    }]
  }
})

const opcionesRadar: ChartOptions<'radar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } }
}

// --- 6. Dispersión temperatura vs humedad del aire ----------------------------------------
const dataDispersion = computed<ChartData<'scatter'>>(() => ({
  datasets: [{
    label: 'Temperatura vs humedad del aire',
    data: serie.value.map(p => ({ x: p.temperatura, y: p.humedadAire })),
    backgroundColor: alfa(COLOR.humedadAire, 0.55),
    pointRadius: 3
  }]
}))

const opcionesDispersion: ChartOptions<'scatter'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: true, text: 'Temperatura (°C)' } },
    y: { title: { display: true, text: 'Humedad del aire (%)' } }
  }
}

const correlacion = computed(() => {
  const r = pearson(serie.value.map(p => p.temperatura), serie.value.map(p => p.humedadAire))
  if (r === null) return null
  const fuerza = Math.abs(r) < 0.3 ? 'débil' : Math.abs(r) < 0.7 ? 'moderada' : 'fuerte'
  return { r, texto: `${fuerza} ${r < 0 ? 'negativa' : 'positiva'}` }
})

// --- 7. Tabla de actuadores ---------------------------------------------------------------
const filasActuadores = computed(() => {
  const e = estadisticas.value
  if (!e) return []
  return [
    { nombre: 'Caloventor', estado: 'encendido', uso: e.usoPromedioCaloventor, horas: e.horasCaloventor, kwh: e.kwhCaloventor },
    { nombre: 'Humidificador', estado: 'encendido', uso: e.usoPromedioHumidificador, horas: e.horasHumidificador, kwh: e.kwhHumidificador },
    { nombre: 'Ventanales', estado: 'abiertos', uso: e.usoPromedioVentanales, horas: e.horasVentanales, kwh: null },
    { nombre: 'Persianas', estado: 'enrolladas', uso: e.usoPromedioPersianas, horas: e.horasPersianas, kwh: null },
    { nombre: 'Bomba de agua', estado: 'encendida', uso: e.usoPromedioBomba, horas: e.horasBomba, kwh: e.kwhBomba }
  ]
})
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted mb-0">
        Cálculos sobre los últimos 30 días, agregados en el backend.
      </p>
      <button class="btn btn-sm btn-outline-success" :disabled="estado === 'cargando'" @click="cargar">
        <i class="fas fa-sync-alt mr-1"></i> Actualizar
      </button>
    </div>

    <div v-if="estado === 'error'" class="alert alert-danger">
      No se pudo obtener la información del backend.
      <button class="btn btn-sm btn-outline-danger ml-2" @click="cargar">Reintentar</button>
    </div>

    <div v-else-if="estado === 'cargando'" class="estado-vacio"><p>Cargando datos del gemelo digital...</p></div>

    <div v-else-if="!estadisticas || estadisticas.registrosAnalizados === 0" class="estado-vacio">
      <p>Aún no hay datos consolidados. El backend guarda un registro por minuto.</p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="kpis-grid">
        <div v-for="k in kpis" :key="k.titulo" class="kpi" :class="{ 'kpi-alerta': k.alerta }">
          <h3>{{ k.titulo }}</h3>
          <p class="valor">{{ k.valor }}</p>
          <span class="detalle">{{ k.detalle }}</span>
        </div>
      </div>

      <!-- Tendencia -->
      <div class="row">
        <div class="col-12 mb-3">
          <div class="card card-outline card-success shadow-sm">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Evolución climática (30 días, promediada por tramos)</h3>
            </div>
            <div class="card-body">
              <div class="chart-wrapper"><Line :data="dataTendencia" :options="opcionesTendencia" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banda diaria y % en rango -->
      <div class="row">
        <div class="col-lg-7 mb-3">
          <div class="card card-outline card-success shadow-sm h-100">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Rango térmico diario (mínima, media y máxima)</h3>
            </div>
            <div class="card-body">
              <div class="chart-wrapper"><Line :data="dataBanda" :options="opcionesBanda" /></div>
              <p class="nota">La banda sombreada es la amplitud térmica del día. Una amplitud grande estresa el cultivo.</p>
            </div>
          </div>
        </div>
        <div class="col-lg-5 mb-3">
          <div class="card card-outline card-success shadow-sm h-100">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Tiempo dentro de los umbrales</h3>
            </div>
            <div class="card-body">
              <div class="chart-wrapper"><Bar :data="dataRango" :options="opcionesRango" /></div>
              <p class="nota">Mide la calidad del control automático. Se evalúa con los umbrales vigentes y los promedios por minuto.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pizza, radar, dispersión -->
      <div class="row">
        <div class="col-lg-4 mb-3">
          <div class="card card-outline card-success shadow-sm h-100">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Reparto del consumo energético</h3>
            </div>
            <div class="card-body">
              <div v-if="energiaTotal > 0" class="chart-wrapper">
                <Pie :data="dataEnergia" :options="opcionesEnergia" />
              </div>
              <p v-else class="text-center text-muted py-5 mb-0">Sin consumo registrado en el período.</p>
              <p class="nota">Estimación con potencias nominales configurables en el backend. Los motores de ventanales y persianas no se incluyen.</p>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card card-outline card-success shadow-sm h-100">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Perfil de uso de actuadores</h3>
            </div>
            <div class="card-body">
              <div class="chart-wrapper"><Radar :data="dataRadar" :options="opcionesRadar" /></div>
              <p class="nota">Porcentaje del tiempo en estado activo. En ventanales significa abiertos y en persianas, enrolladas.</p>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card card-outline card-success shadow-sm h-100">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Temperatura vs humedad del aire</h3>
            </div>
            <div class="card-body">
              <div class="chart-wrapper"><Scatter :data="dataDispersion" :options="opcionesDispersion" /></div>
              <p class="nota">
                <template v-if="correlacion">
                  Correlación de Pearson: <strong>{{ correlacion.r.toFixed(2) }}</strong> ({{ correlacion.texto }}).
                </template>
                <template v-else>Datos insuficientes para calcular la correlación.</template>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de actuadores -->
      <div class="row">
        <div class="col-12 mb-3">
          <div class="card card-outline card-success shadow-sm">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">Resumen por actuador</h3>
            </div>
            <div class="card-body p-0">
              <table class="table mb-0 text-center">
                <thead>
                  <tr>
                    <th class="text-left pl-3">Actuador</th>
                    <th>% del tiempo activo</th>
                    <th>Horas activo</th>
                    <th>Energía estimada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in filasActuadores" :key="f.nombre">
                    <td class="text-left pl-3">{{ f.nombre }} <small class="text-muted">({{ f.estado }})</small></td>
                    <td>{{ f.uso.toFixed(1) }} %</td>
                    <td>{{ f.horas.toFixed(2) }} h</td>
                    <td>{{ f.kwh === null ? '—' : f.kwh.toFixed(2) + ' kWh' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}
.nota {
  font-size: .8rem;
  color: #7f8c8d;
  margin: .75rem 0 0;
}
.estado-vacio {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 3rem;
}
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.kpi {
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 5px solid #42b983;
}
.kpi-alerta {
  border-left-color: #e74c3c;
  background-color: #fdf5f4;
}
.kpi h3 { margin: 0; font-size: .95rem; color: #7f8c8d; }
.kpi .valor { font-size: 1.7rem; font-weight: bold; color: #2c3e50; margin: .35rem 0; }
.kpi .detalle { font-size: .8rem; color: #95a5a6; }
</style>