<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Variables reactivas para los datos de los sensores
const datosSensores = ref({
  temperatura: 0,
  humedadAire: 0,
  humedadSuelo: 0,
  estadoVentilador: false,
  estadoBomba: false
})

let intervaloFetch: ReturnType<typeof setInterval>;

// Función simulada para obtener datos del backend en Spring
const obtenerDatosDelBackend = async () => {
  try {
    // Aquí iría tu llamado HTTP real: const response = await fetch('http://tu-backend-spring/api/sensores')
    console.log("Obteniendo datos del backend Spring...");
    // Simulamos la respuesta
    datosSensores.value = {
      temperatura: 24.5,
      humedadAire: 60,
      humedadSuelo: 45,
      estadoVentilador: true,
      estadoBomba: false
    }
    // TODO: Aquí llamarías a la función de Three.js para cambiar el color de las partes del modelo de Blender
    // en base a datosSensores.value
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

onMounted(() => {
  // Ejecutar inmediatamente y luego cada 5 segundos
  obtenerDatosDelBackend();
  intervaloFetch = setInterval(obtenerDatosDelBackend, 5000);
})

onUnmounted(() => {
  // Limpiar el intervalo al salir de la página
  clearInterval(intervaloFetch);
})
</script>

<template>
  <section>
    <h2>Modelo 3D y Datos en Tiempo Real</h2>
    
    <div>
      <h3>Lecturas Actuales</h3>
      <ul>
        <li>Temperatura: {{ datosSensores.temperatura }} °C</li>
        <li>Humedad del Aire: {{ datosSensores.humedadAire }} %</li>
        <li>Humedad del Suelo: {{ datosSensores.humedadSuelo }} %</li>
        <li>Ventilador: {{ datosSensores.estadoVentilador ? 'Activo' : 'Inactivo' }}</li>
        <li>Bomba de Riego: {{ datosSensores.estadoBomba ? 'Activo' : 'Inactivo' }}</li>
      </ul>
    </div>

    <div id="contenedor-3d">
      <p>[ Aquí se renderizará el modelo 3D de Blender ]</p>
    </div>
  </section>
</template>