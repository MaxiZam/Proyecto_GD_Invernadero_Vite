<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'

// Definimos los argumentos como constantes para evitar errores de tipo
const boxArgs = [3, 2, 5] as const
const gridArgs = [10, 10] as const
</script>

<template>
    <section class="top-bar">
      <div class="status-indicator">
        <span class="dot"></span> Sistema Activo
      </div>
      <h1>Vista del Gemelo Digital</h1>
    </section>

    <div class="dashboard-grid">
      <div class="canvas-wrapper">
        <TresCanvas clear-color="#111" shadows alpha>
          <TresPerspectiveCamera :position="[7, 7, 7]" />
          <OrbitControls />
          <Stars :radius="100" :depth="50" :count="5000" :factor="4" :saturation="0" fade :speed="1" />
          <TresAmbientLight :intensity="0.5" />
          <TresDirectionalLight :position="[10, 10, 10]" :intensity="1" />
          
          <TresMesh :position="[0, 1, 0]">
            <TresBoxGeometry :args="boxArgs" />
            <TresMeshStandardMaterial color="#4ade80" :transparent="true" :opacity="0.4" />
          </TresMesh>
          <TresGridHelper :args="gridArgs" />
        </TresCanvas>
      </div>

      <aside class="stats-panel">
        <div class="stat-card">
          <span class="label">Temperatura</span>
          <span class="value">24°C</span>
        </div>
        <div class="stat-card">
          <span class="label">Humedad Aire</span>
          <span class="value">60%</span>
        </div>
        <div class="stat-card">
          <span class="label">Humedad Suelo</span>
          <span class="value">45%</span>
        </div>
        <div class="stat-card">
          <span class="label">Iluminación</span>
          <span class="value">800 Lux</span>
        </div>
      </aside>
    </div>
</template>

<style scoped>
/* Contenedor Principal */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.top-bar {
  padding: 1rem 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-indicator {
  font-size: 0.8rem;
  background: #222;
  padding: 4px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; display: inline-block; }

/* GRID RESPONSIVO (La magia ocurre aquí) */
.dashboard-grid {
  display: flex;
  flex-direction: row; /* Horizontal en pantallas grandes */
  flex-wrap: wrap;
  width: 100%;
  height: 60vh; /* Altura para el área 3D */
}

.canvas-wrapper {
  flex: 3; /* Ocupa más espacio */
  min-width: 300px;
  height: 100%;
  background: #000;
}

.stats-panel {
  flex: 1; /* Ocupa menos espacio lateral */
  min-width: 250px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #161616;
}

/* Tarjetas */
.stat-card {
  background: #222;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #333;
}
.label { font-size: 0.75rem; color: #888; text-transform: uppercase; }
.value { font-size: 1.5rem; font-weight: bold; color: #4ade80; }

/* Media Query para Pantallas Pequeñas */
@media (max-width: 768px) {
  .dashboard-grid {
    flex-direction: column; /* Cambia a vertical */
    height: auto;
  }
  .canvas-wrapper {
    height: 400px; /* Altura fija en móviles */
  }
  .navbar span { display: none; } /* Oculta texto del logo si es muy pequeño */
}
</style>