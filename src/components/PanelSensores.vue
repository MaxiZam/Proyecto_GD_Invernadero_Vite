<script setup lang="ts">
defineProps<{
  temperatura: number
  humedadAire: number
  humedadSuelo: number
  luminosidad: number
  alertaTemp: boolean
  alertaHum: boolean
  alertaSuelo: boolean
  alertaLuz: boolean
  timestamp: string
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
            <div class="sensor-bar" :style="{ width: Math.min(temperatura / 45 * 100, 100) + '%', background: alertaTemp ? '#ff4444' : '#4ade80' }"></div>
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
            <div class="sensor-bar" :style="{ width: humedadAire + '%', background: alertaHum ? '#ff4444' : '#38bdf8' }"></div>
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
            <div class="sensor-bar" :style="{ width: humedadSuelo + '%', background: alertaSuelo ? '#ff4444' : '#a3e635' }"></div>
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
            <div class="sensor-bar" :style="{ width: Math.min(luminosidad / 1500 * 100, 100) + '%', background: alertaLuz ? '#ff4444' : '#fbbf24' }"></div>
          </div>
          <div class="sensor-status" :class="{ ok: !alertaLuz, warn: alertaLuz }">
            {{ alertaLuz ? '⚠ Luz insuficiente — lámpara recomendada' : '✓ Iluminación correcta' }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sensores-section {
  padding: 2rem 5%;
  background: #0e1a0e;
  border-top: 1px solid #1f3a1f;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.8rem;
}

.section-badge {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4ade80;
  background: #0a2a0a;
  border: 1px solid #2a5a2a;
  padding: 3px 10px;
  border-radius: 4px;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.section-header h2 {
  font-family: 'Georgia', serif;
  color: #e8f5e8;
  font-size: 1.4rem;
  margin: 0;
}

.ts {
  margin-left: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: #4a7a4a;
}

.sensores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.2rem;
}

.sensor-card {
  background: #141f14;
  border: 1px solid #1f3a1f;
  border-radius: 14px;
  padding: 1.4rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sensor-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: #4ade80;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.sensor-card.alerta {
  border-color: #7a1a1a;
  background: #1f0e0e;
}

.sensor-card.alerta::before {
  background: #ff4444;
  opacity: 0.8;
  animation: pulse-bar 1.2s ease infinite;
}

@keyframes pulse-bar {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.2; }
}

.sensor-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.sensor-info { flex: 1; }

.sensor-label {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: #5a8a5a;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.sensor-value {
  font-family: 'Georgia', serif;
  font-size: 2.4rem;
  font-weight: bold;
  color: #e8f5e8;
  line-height: 1;
  margin-bottom: 0.6rem;
}

.sensor-card.alerta .sensor-value { color: #ff8888; }

.unit {
  font-size: 1rem;
  color: #4ade80;
  margin-left: 3px;
}
.sensor-card.alerta .unit { color: #ff6666; }

.sensor-bar-wrap {
  height: 5px;
  background: #1f3a1f;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.sensor-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease, background 0.5s ease;
}

.sensor-status {
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
}

.sensor-status.ok   { color: #4ade80; }
.sensor-status.warn { color: #ff6666; }

@media (max-width: 768px) {
  .sensores-grid { grid-template-columns: 1fr; }
  .ts { margin-left: 0; width: 100%; }
}
</style>