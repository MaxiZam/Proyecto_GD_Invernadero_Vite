<script setup lang="ts">
import './styles/PanelSensores.css'

defineProps<{
  temperatura  : number
  humedadAire  : number
  humedadSuelo : number
  luminosidad  : number
  alertaTemp   : boolean
  alertaHum    : boolean
  alertaSuelo  : boolean
  alertaLuz    : boolean
  timestamp    : string
}>()
</script>

<template>
  <section class="sensores-section">
    <div class="section-header">
      <div class="section-badge">TIEMPO REAL</div>
      <h2>📡 Datos de Sensores</h2>
      <span class="ts">Última actualización: {{ timestamp }}</span>
    </div>

    <div class="sensores-grid">

      <!-- Temperatura -->
      <div class="sensor-card" :class="{ alerta: alertaTemp }">
        <div class="sensor-icon">🌡️</div>
        <div class="sensor-info">
          <div class="sensor-label">Temperatura Ambiente</div>
          <div class="sensor-value">
            {{ temperatura }}<span class="unit">°C</span>
          </div>
          <div class="sensor-bar-wrap">
            <div
              class="sensor-bar"
              :style="{
                width     : Math.min(temperatura / 45 * 100, 100) + '%',
                background: alertaTemp ? '#ff4444' : '#4ade80'
              }"
            ></div>
          </div>
          <div class="sensor-status" :class="{ ok: !alertaTemp, warn: alertaTemp }">
            {{ alertaTemp ? '⚠ Fuera de rango óptimo (15–28°C)' : '✓ Rango óptimo' }}
          </div>
        </div>
      </div>

      <!-- Humedad Aire -->
      <div class="sensor-card" :class="{ alerta: alertaHum }">
        <div class="sensor-icon">💧</div>
        <div class="sensor-info">
          <div class="sensor-label">Humedad Relativa Aire</div>
          <div class="sensor-value">
            {{ humedadAire }}<span class="unit">%</span>
          </div>
          <div class="sensor-bar-wrap">
            <div
              class="sensor-bar"
              :style="{
                width     : humedadAire + '%',
                background: alertaHum ? '#ff4444' : '#38bdf8'
              }"
            ></div>
          </div>
          <div class="sensor-status" :class="{ ok: !alertaHum, warn: alertaHum }">
            {{ alertaHum ? '⚠ Fuera de rango óptimo (40–85%)' : '✓ Rango óptimo' }}
          </div>
        </div>
      </div>

      <!-- Humedad Suelo -->
      <div class="sensor-card" :class="{ alerta: alertaSuelo }">
        <div class="sensor-icon">🌱</div>
        <div class="sensor-info">
          <div class="sensor-label">Humedad del Suelo</div>
          <div class="sensor-value">
            {{ humedadSuelo }}<span class="unit">%</span>
          </div>
          <div class="sensor-bar-wrap">
            <div
              class="sensor-bar"
              :style="{
                width     : humedadSuelo + '%',
                background: alertaSuelo ? '#ff4444' : '#a3e635'
              }"
            ></div>
          </div>
          <div class="sensor-status" :class="{ ok: !alertaSuelo, warn: alertaSuelo }">
            {{ alertaSuelo ? '⚠ Suelo seco — riego recomendado' : '✓ Humedad adecuada' }}
          </div>
        </div>
      </div>

      <!-- Luminosidad -->
      <div class="sensor-card" :class="{ alerta: alertaLuz }">
        <div class="sensor-icon">☀️</div>
        <div class="sensor-info">
          <div class="sensor-label">Luminosidad (Lux)</div>
          <div class="sensor-value">
            {{ luminosidad }}<span class="unit">lx</span>
          </div>
          <div class="sensor-bar-wrap">
            <div
              class="sensor-bar"
              :style="{
                width     : Math.min(luminosidad / 1500 * 100, 100) + '%',
                background: alertaLuz ? '#ff4444' : '#fbbf24'
              }"
            ></div>
          </div>
          <div class="sensor-status" :class="{ ok: !alertaLuz, warn: alertaLuz }">
            {{ alertaLuz ? '⚠ Luz insuficiente — lámpara recomendada' : '✓ Iluminación correcta' }}
          </div>
        </div>
      </div>

    </div>
  </section>
</template>