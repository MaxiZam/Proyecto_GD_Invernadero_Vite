<template>
  <div class="historial-container">
    <h1 class="titulo">Registro Histórico del Invernadero</h1>

    <form class="filtros" @submit.prevent="cargar">
      <label>Desde <input type="datetime-local" v-model="desde" class="form-control form-control-sm"></label>
      <label>Hasta <input type="datetime-local" v-model="hasta" class="form-control form-control-sm"></label>
      <button type="submit" class="btn btn-success btn-sm">
        <i class="fas fa-search mr-1"></i> Filtrar
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="limpiarFiltro">Últimos registros</button>
      <button type="button" class="btn btn-outline-success btn-sm ml-auto"
              :disabled="historial.length === 0" @click="exportarCsv">
        <i class="fas fa-file-csv mr-1"></i> Exportar CSV
      </button>
    </form>

    <div v-if="aviso" class="alert alert-warning py-2">{{ aviso }}</div>

    <div v-if="estado === 'cargando'" class="cargando"><p>Cargando registros históricos...</p></div>

    <div v-else-if="estado === 'error'" class="alert alert-danger">
      No se pudieron obtener los registros. {{ errorMsg }}
      <button class="btn btn-sm btn-outline-danger ml-2" @click="cargar">Reintentar</button>
    </div>

    <div v-else-if="historial.length === 0" class="cargando">
      <p>No hay registros para el período seleccionado.</p>
    </div>

    <template v-else>
      <div class="tabla-wrapper">
        <table class="tabla-datos">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Temp. Promedio</th>
              <th>HumSuelo. Promedio</th>
              <th>HumAire. Promedio</th>
              <th>Luminosidad</th>
              <th>Uso Caloventor</th>
              <th>Uso Humidificador</th>
              <th>Uso Ventanales</th>
              <th>Uso Persianas</th>
              <th>Uso Bomba de Agua</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in visibles" :key="r.id">
              <td>{{ fmtFecha(r.fechaHora) }}</td>
              <td>{{ r.temperaturaMedia.toFixed(2) }} °C</td>
              <td>{{ r.humedadSueloMedia.toFixed(2) }} %</td>
              <td>{{ r.humedadAireMedia.toFixed(2) }} %</td>
              <td>{{ Math.round(r.luminosidadMedia) }} lux</td>
              <td>{{ r.porcentajeCaloventor.toFixed(1) }} %</td>
              <td>{{ r.porcentajeHumidificador.toFixed(1) }} %</td>
              <td>{{ r.porcentajeVentanales.toFixed(1) }} %</td>
              <td>{{ r.porcentajePersianas.toFixed(1) }} %</td>
              <td>{{ r.porcentajeBomba.toFixed(1) }} %</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="paginacion">
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagina === 1" @click="pagina--">‹ Anterior</button>
        <span>Página {{ pagina }} de {{ totalPaginas }} ({{ historial.length }} registros)</span>
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagina === totalPaginas" @click="pagina++">Siguiente ›</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getJson } from '../services/api'

interface Registro {
  id: number; fechaHora: string
  temperaturaMedia: number; humedadSueloMedia: number; humedadAireMedia: number; luminosidadMedia: number
  porcentajeCaloventor: number; porcentajeHumidificador: number
  porcentajeVentanales: number; porcentajePersianas: number; porcentajeBomba: number
}

const MAX_DIAS = 14
const POR_PAGINA = 50

const historial = ref<Registro[]>([])
const estado = ref<'cargando' | 'ok' | 'error'>('cargando')
const errorMsg = ref('')
const aviso = ref('')
const desde = ref('')
const hasta = ref('')
const pagina = ref(1)

const totalPaginas = computed(() => Math.max(1, Math.ceil(historial.value.length / POR_PAGINA)))
const visibles = computed(() => historial.value.slice((pagina.value - 1) * POR_PAGINA, pagina.value * POR_PAGINA))

const fmtFecha = (f: string) => new Date(f).toLocaleString('es-AR')

const validarRango = (): string => {
  if (!desde.value && !hasta.value) return ''
  if (!desde.value || !hasta.value) return 'Completa ambas fechas o deja las dos vacías.'
  const ini = new Date(desde.value).getTime(), fin = new Date(hasta.value).getTime()
  if (ini >= fin) return 'La fecha inicial debe ser anterior a la final.'
  if (fin - ini > MAX_DIAS * 86_400_000) return `El rango máximo es de ${MAX_DIAS} días.`
  return ''
}

const cargar = async () => {
  aviso.value = validarRango()
  if (aviso.value) return

  estado.value = 'cargando'
  try {
    if (desde.value && hasta.value) {
      const q = new URLSearchParams({ fechaInicio: desde.value + ':00', fechaFin: hasta.value + ':00' })
      const datos = await getJson<Registro[]>(`/api/invernadero/historial/rango?${q}`)
      historial.value = [...datos].reverse()   // el endpoint devuelve ascendente; mostramos lo más reciente primero
    } else {
      historial.value = await getJson<Registro[]>('/api/invernadero/historial-completo?size=200')
    }
    pagina.value = 1
    estado.value = 'ok'
  } catch (e) {
    console.error(e)
    errorMsg.value = e instanceof Error ? e.message : String(e)
    estado.value = 'error'
  }
}

const limpiarFiltro = () => {
  desde.value = ''
  hasta.value = ''
  cargar()
}

// CSV con ';' y coma decimal, para que Excel en configuración regional es-AR lo abra bien
const exportarCsv = () => {
  const cab = ['Fecha', 'Temp media (C)', 'Hum suelo media (%)', 'Hum aire media (%)', 'Luminosidad media (lux)',
    'Uso caloventor (%)', 'Uso humidificador (%)', 'Uso ventanales (%)', 'Uso persianas (%)', 'Uso bomba (%)']
  const n = (v: number) => String(v).replace('.', ',')
  const filas = historial.value.map(r => [
    fmtFecha(r.fechaHora), n(r.temperaturaMedia), n(r.humedadSueloMedia), n(r.humedadAireMedia), n(r.luminosidadMedia),
    n(r.porcentajeCaloventor), n(r.porcentajeHumidificador), n(r.porcentajeVentanales),
    n(r.porcentajePersianas), n(r.porcentajeBomba)
  ].join(';'))
  const blob = new Blob(['\uFEFF' + [cab.join(';'), ...filas].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'historial_invernadero.csv'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(cargar)
</script>

<style scoped>
.historial-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filtros label {
  margin: 0;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.tabla-wrapper {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow-x: auto;
}

.tabla-datos {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.tabla-datos th {
  background-color: #42b983;
  color: white;
  padding: 1rem;
  font-weight: 600;
}

.tabla-datos td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  color: #34495e;
  white-space: nowrap;
}

.tabla-datos tbody tr:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  color: #7f8c8d;
}

.cargando {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 3rem;
}
</style>