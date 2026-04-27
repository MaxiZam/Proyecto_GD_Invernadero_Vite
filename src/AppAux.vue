<script setup lang="ts">
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'

// Argumentos fijos para TypeScript
const boxArgs = [3, 2, 5] as const
const gridArgs = [10, 10] as const

// ESTADOS REACTIVOS PARA ACTUADORES
const bombaActiva = ref(false)
const ventiladorActivo = ref(true)
const riegoActivo = ref(false)
</script>

<template>
  <div class="layout-wrapper">
    <header class="navbar">
      <div class="logo">🌿 <span>Invernadero Digital</span></div>
      <nav class="nav-links">
        <a href="#">Dashboard</a>
        <a href="#">Monitoreo</a>
        <a href="#">Alertas</a>
      </nav>
    </header>

    <main class="main-container">
      <section class="top-bar">
        <div class="status-indicator">
          <span class="dot"></span> Sistema Activo
        </div>
        <h1>Gemelo Digital Invernadero</h1>
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
            <span class="label">Humedad Relativa</span>
            <span class="value">60%</span>
          </div>
          <div class="stat-card">
            <span class="label">pH Suelo</span>
            <span class="value">6.5</span>
          </div>
          <div class="stat-card">
            <span class="label">Punto de Rocío</span>
            <span class="value">16.2°C</span>
          </div>
        </aside>
      </div>

      <section class="analysis-section">
        <div class="analysis-card">
          <h3>Gráficos de Correlación</h3>
          <div class="chart-placeholder">
            <p>[ Gráfico: Temperatura vs Humedad ]</p>
            <div class="mock-chart">
              <div class="bar" style="height: 60%"></div>
              <div class="bar" style="height: 80%"></div>
              <div class="bar" style="height: 40%"></div>
              <div class="bar" style="height: 90%"></div>
            </div>
          </div>
        </div>

        <section class="controls-section">
        <div class="section-title">
          <h2>Panel de Actuadores</h2>
          <p>Control manual de dispositivos mecánicos</p>
        </div>
        <div class="controls-grid">
          <div class="control-card" :class="{ 'active-bg': bombaActiva }">
            <div class="control-info">
              <span class="icon">💧</span>
              <span>Bomba de Agua</span>
            </div>
            <button @click="bombaActiva = !bombaActiva" class="switch-btn">
              {{ bombaActiva ? 'APAGAR' : 'ENCENDER' }}
            </button>
          </div>

          <div class="control-card" :class="{ 'active-bg': ventiladorActivo }">
            <div class="control-info">
              <span class="icon">💨</span>
              <span>Ventilación</span>
            </div>
            <button @click="ventiladorActivo = !ventiladorActivo" class="switch-btn">
              {{ ventiladorActivo ? 'APAGAR' : 'ENCENDER' }}
            </button>
          </div>

          <div class="control-card" :class="{ 'active-bg': riegoActivo }">
            <div class="control-info">
              <span class="icon">🚿</span>
              <span>Sistema de Riego</span>
            </div>
            <button @click="riegoActivo = !riegoActivo" class="switch-btn">
              {{ riegoActivo ? 'APAGAR' : 'ENCENDER' }}
            </button>
          </div>
        </div>
      </section>

        <div class="analysis-card">
          <h3>Informes de Rendimiento</h3>
          <ul class="report-list">
            <li><span>Eficiencia Energética:</span> <strong>92%</strong></li>
            <li><span>Consumo de Agua:</span> <strong>Óptimo</strong></li>
            <li><span>Estado Actuadores:</span> <strong>Sin errores</strong></li>
          </ul>
          <button class="btn-report">Descargar PDF</button>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>UNRN - Licenciatura en Sistemas - 2026</p>
    </footer>
  </div>
</template>

<style name="App.css" src="./App.css"></style>