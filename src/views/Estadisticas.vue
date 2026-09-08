<template>
  <div class="dashboard-container">
    <h1 class="titulo">Análisis Agronómico Mensual</h1>

    <!-- Tarjetas de resumen  -->
    <div class="tarjetas-grid" v-if="estadisticas">
      <div class="tarjeta alerta" v-if="estadisticas.diasRiesgoFungico > 0">
        <h3>Riesgo Fúngico</h3>
        <p class="valor">{{ estadisticas.diasRiesgoFungico }} días</p>
        <span class="detalle">Humedad > 80%</span>
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
        <h3>Luminosidad Media</h3>
        <p class="valor">{{ Math.round(estadisticas.luminosidadMediaMensual) }} lux</p>
        <span class="detalle">Promedio diario</span>
      </div>
    </div>

    <!-- Seccion de graficos -->
    <div class="graficos-grid" v-if="historialCargado">
      
      <!-- Graficos de tendencia -->
      <div class="grafico-card">
        <h3>Evolución Climática (Últimos 30 días)</h3>
        <div class="chart-wrapper">
          <Line :data="chartDataClima" :options="chartOptionsClima" />
        </div>
      </div>

      <!-- graficos de actuadores  -->
      <div class="grafico-card">
        <h3>Eficiencia de Actuadores (% de Uso Diario)</h3>
        <div class="chart-wrapper">
          <Bar :data="chartDataActuadores" :options="chartOptionsActuadores" />
        </div>
      </div>

    </div>
    
    <div v-else class="cargando">
      <p>Cargando datos del gemelo digital...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const estadisticas = ref(null)
const historial = ref([])
const historialCargado = ref(false)

// Recuperar datos del Backend
const cargarDatos = async () => {
  try {
    // recuperar el resumen mensual
    const resStats = await fetch('http://localhost:8080/api/invernadero/estadisticas')
    estadisticas.value = await resStats.json()

    // recuperar el historial diario
    const resHistorial = await fetch('http://localhost:8080/api/invernadero/historial')
    historial.value = await resHistorial.json()
    
    historialCargado.value = true
  } catch (error) {
    console.error('Error al conectar con el backend:', error)
  }
}

onMounted(() => {
  cargarDatos()
})


// CONFIGURACION: grafico de lineas (sensores)
const chartDataClima = computed(() => {
  const fechas = historial.value.map(dato => dato.fecha)
  const temperaturas = historial.value.map(dato => dato.tempPromedio)
  const humedades = historial.value.map(dato => dato.humPromedioSuelo)

  return {
    labels: fechas,
    datasets: [
      {
        label: 'Temperatura (°C)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        data: temperaturas,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Humedad (%)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        data: humedades,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }
})

const chartOptionsClima = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'Temperatura (°C)' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Humedad (%)' },
      grid: { drawOnChartArea: false }
    }
  }
}


// CONFIGURACION: grafico de barras (actuadores)
const chartDataActuadores = computed(() => {
  return {
    labels: ['Caloventor', 'Ventanales', 'Humidificador', 'Bomba de agua'],
    datasets: [
      {
        label: '% de tiempo encendido/abierto',
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        data: [
          estadisticas.value.usoPromedioCaloventor,
          estadisticas.value.usoPromedioVentanales,
          estadisticas.value.usoPromedioHumidificador,
          estadisticas.value.usoPromedioBomba
        ]
      }
    ]
  }
})

const chartOptionsActuadores = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: { display: true, text: 'Porcentaje (%)' }
    }
  }
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

/* Estilos de las tarjetas */
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

/* Estilos de los graficos */
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