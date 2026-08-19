<template>
  <div class="historial-container">
    <h1 class="titulo">Registro Histórico del Invernadero</h1>

    <div class="tabla-wrapper" v-if="historial.length > 0">
      <table class="tabla-datos">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Temp. Promedio</th>
            <th>Hum. Promedio</th>
            <th>Luminosidad</th>
            <th>Uso Caloventor</th>
            <th>Uso Humidificador</th>
            <th>Uso Ventanales</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="registro in historial" :key="registro.id">
            <td>{{ formatearFecha(registro.fecha) }}</td>
            <td>{{ registro.tempPromedio.toFixed(2) }} °C</td>
            <td>{{ registro.humPromedio.toFixed(2) }} %</td>
            <td>{{ registro.lumPromedio }} lux</td>
            <td>{{ registro.caloventorUsoPorcentaje.toFixed(1) }} %</td>
            <td>{{ registro.humidificadorUsoPorcentaje.toFixed(1) }} %</td>
            <td>{{ registro.ventanalesUsoPorcentaje.toFixed(1) }} %</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="cargando">
      <p>Cargando registros históricos...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const historial = ref([])

// Función para consultar el nuevo endpoint
const cargarTabla = async () => {
  try {
    const respuesta = await fetch('http://localhost:8080/api/invernadero/historial-completo')
    historial.value = await respuesta.json()
  } catch (error) {
    console.error('Error al cargar la tabla:', error)
  }
}

// Función para que la fecha se vea como "19/08/2026" en lugar de "2026-08-19"
const formatearFecha = (fechaString) => {
  if (!fechaString) return '-'
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' }
  return new Date(fechaString).toLocaleDateString('es-AR', opciones)
}

onMounted(() => {
  cargarTabla()
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