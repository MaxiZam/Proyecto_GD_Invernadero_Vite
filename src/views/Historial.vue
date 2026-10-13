<template>
  <div class="historial-container">
    <h1 class="titulo">Registro Histórico del Invernadero</h1>

    <div class="tabla-wrapper" v-if="historial.length > 0">
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
            <th>Uso Bomba de Agua</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="registro in historial" :key="registro.id">
            <td>{{ registro.fechaHora }}</td>
            <td>{{ registro.temperaturaMedia.toFixed(2) }} °C</td>
            <td>{{ registro.humedadSueloMedia.toFixed(2) }} %</td>
            <td>{{ registro.humedadAireMedia.toFixed(2) }} %</td>
            <td>{{ registro.luminosidadMedia }} lux</td>
            <td>{{ registro.porcentajeCaloventor.toFixed(1) }} %</td>
            <td>{{ registro.porcentajeHumidificador.toFixed(1) }} %</td>
            <td>{{ registro.porcentajeVentanales.toFixed(1) }} %</td>
            <td>{{ registro.porcentajeBomba.toFixed(1) }} %</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="cargando">
      <p>Cargando registros históricos...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getJson } from '../services/api'

interface Registro {
  id: number; fechaHora: string
  temperaturaMedia: number; humedadSueloMedia: number; humedadAireMedia: number; luminosidadMedia: number
  porcentajeCaloventor: number; porcentajeHumidificador: number
  porcentajeVentanales: number; porcentajePersianas: number; porcentajeBomba: number
}
const historial = ref<Registro[]>([])
const estado = ref<'cargando' | 'ok' | 'error'>('cargando')

onMounted(async () => {
  try { historial.value = await getJson<Registro[]>('/api/invernadero/historial-completo?size=200'); estado.value = 'ok' }
  catch (e) { console.error(e); estado.value = 'error' }
})
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
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.tabla-wrapper {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow-x: auto; /* Permite scroll horizontal si la pantalla es pequeña */
}

.tabla-datos {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.tabla-datos th {
  background-color: #42b983; /* Color Vue */
  color: white;
  padding: 1rem;
  font-weight: 600;
}

.tabla-datos td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #34495e;
}

.tabla-datos tbody tr:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.cargando {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 3rem;
}
</style>