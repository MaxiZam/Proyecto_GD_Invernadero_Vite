<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  histTemp:  number[]   // últimos 50 registros de temperatura
  histHum:   number[]   // últimos 50 registros de humedad
}>()

// ── Helpers SVG ──────────────────────────────────────────────────
const W = 480
const H = 140
const PAD = { top: 12, right: 12, bottom: 28, left: 38 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

function normalize(vals: number[], min: number, max: number) {
  return vals.map(v => (v - min) / (max - min))
}

function polyline(vals: number[], min: number, max: number) {
  const norm = normalize(vals, min, max)
  return norm.map((v, i) => {
    const x = PAD.left + (i / (vals.length - 1)) * innerW
    const y = PAD.top + innerH - v * innerH
    return `${x},${y}`
  }).join(' ')
}

function area(vals: number[], min: number, max: number) {
  const norm = normalize(vals, min, max)
  const pts = norm.map((v, i) => {
    const x = PAD.left + (i / (vals.length - 1)) * innerW
    const y = PAD.top + innerH - v * innerH
    return `${x},${y}`
  })
  const firstX = PAD.left
  const lastX  = PAD.left + innerW
  const baseY  = PAD.top + innerH
  return `M ${firstX},${baseY} L ${pts.join(' L ')} L ${lastX},${baseY} Z`
}

// Eje Y – 5 ticks
function yTicks(min: number, max: number) {
  return Array.from({ length: 5 }, (_, i) => {
    const val = min + ((max - min) / 4) * i
    const y   = PAD.top + innerH - (i / 4) * innerH
    return { val: val.toFixed(0), y }
  })
}

// Eje X – ticks en posición 0, 12, 25, 37, 49
const xTicks = [0, 12, 24, 37, 49]

// ── Correlación (scatter) ─────────────────────────────────────────
const SCATTER_W = 260
const SCATTER_H = 200
const SP = { top: 14, right: 14, bottom: 36, left: 42 }
const sInnerW = SCATTER_W - SP.left - SP.right
const sInnerH = SCATTER_H - SP.top - SP.bottom

const tempMin = computed(() => Math.min(...props.histTemp) - 1)
const tempMax = computed(() => Math.max(...props.histTemp) + 1)
const humMin  = computed(() => Math.min(...props.histHum)  - 2)
const humMax  = computed(() => Math.max(...props.histHum)  + 2)

const scatterPoints = computed(() => {
  const hum = props.histHum
  return props.histTemp.map((t, i) => {
    const h = hum[i] ?? 0
    const x = SP.left + ((t - tempMin.value) / (tempMax.value - tempMin.value)) * sInnerW
    const y = SP.top  + sInnerH - ((h - humMin.value) / (humMax.value - humMin.value)) * sInnerH
    return { x, y }
  })
})

// Línea de regresión lineal
const regression = computed(() => {
  const hum   = props.histHum
  const n     = props.histTemp.length
  const sumX  = props.histTemp.reduce((a, b) => a + b, 0)
  const sumY  = hum.reduce((a, b) => a + b, 0)
  const sumXY = props.histTemp.reduce((s, t, i) => s + t * (hum[i] ?? 0), 0)
  const sumX2 = props.histTemp.reduce((s, t) => s + t * t, 0)
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n
  const x1 = tempMin.value
  const x2 = tempMax.value
  const y1 = m * x1 + b
  const y2 = m * x2 + b
  const toSvgX = (t: number) => SP.left + ((t - tempMin.value) / (tempMax.value - tempMin.value)) * sInnerW
  const toSvgY = (h: number) => SP.top + sInnerH - ((h - humMin.value) / (humMax.value - humMin.value)) * sInnerH
  return {
    x1: toSvgX(x1), y1: toSvgY(y1),
    x2: toSvgX(x2), y2: toSvgY(y2),
    m: m.toFixed(2), b: b.toFixed(1)
  }
})

// Pearson r
const pearsonR = computed(() => {
  const hum   = props.histHum
  const n     = props.histTemp.length
  const meanX = props.histTemp.reduce((a, b) => a + b, 0) / n
  const meanY = hum.reduce((a, b) => a + b, 0) / n
  const num   = props.histTemp.reduce((s, t, i) => s + (t - meanX) * ((hum[i] ?? 0) - meanY), 0)
  const denX  = Math.sqrt(props.histTemp.reduce((s, t) => s + (t - meanX) ** 2, 0))
  const denY  = Math.sqrt(hum.reduce((s, h) => s + (h - meanY) ** 2, 0))
  return (num / (denX * denY)).toFixed(3)
})

// Stats rápidas
const avgTemp = computed(() => (props.histTemp.reduce((a, b) => a + b, 0) / props.histTemp.length).toFixed(1))
const avgHum  = computed(() => (props.histHum.reduce((a, b) => a + b, 0) / props.histHum.length).toFixed(1))
const maxTemp = computed(() => Math.max(...props.histTemp).toFixed(1))
const minTemp = computed(() => Math.min(...props.histTemp).toFixed(1))
const maxHum  = computed(() => Math.max(...props.histHum).toFixed(0))
const minHum  = computed(() => Math.min(...props.histHum).toFixed(0))
</script>

<template>
  <section class="charts-section">
    <div class="section-header">
      <div class="section-badge">HISTÓRICO · 50 REGISTROS</div>
      <h2>📊 Análisis de Tendencias y Correlación</h2>
    </div>

    <div class="charts-layout">

      <!-- ── Tendencia Temperatura ── -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="dot-red"></span> Temperatura — últimas 50 mediciones
          <div class="chart-stats">
            <span>Prom: <strong>{{ avgTemp }}°C</strong></span>
            <span>Mín: <strong>{{ minTemp }}°C</strong></span>
            <span>Máx: <strong>{{ maxTemp }}°C</strong></span>
          </div>
        </div>
        <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stop-color="#ff6644" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#ff6644" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <!-- Grid horizontal -->
          <line v-for="t in yTicks(10, 40)" :key="t.val"
            :x1="PAD.left" :y1="t.y" :x2="PAD.left + innerW" :y2="t.y"
            stroke="#1f3a1f" stroke-width="1" />

          <!-- Grid vertical -->
          <line v-for="xi in xTicks" :key="xi"
            :x1="PAD.left + (xi / 49) * innerW" :y1="PAD.top"
            :x2="PAD.left + (xi / 49) * innerW" :y2="PAD.top + innerH"
            stroke="#1f3a1f" stroke-width="1" />

          <!-- Área rellena -->
          <path :d="area(histTemp, 10, 40)" fill="url(#gradTemp)" />

          <!-- Línea -->
          <polyline
            :points="polyline(histTemp, 10, 40)"
            fill="none" stroke="#ff6644" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round"
          />

          <!-- Labels eje Y -->
          <text v-for="t in yTicks(10, 40)" :key="'ty'+t.val"
            :x="PAD.left - 6" :y="t.y + 4"
            text-anchor="end" font-size="9" fill="#4a7a4a" font-family="Courier New">
            {{ t.val }}°
          </text>

          <!-- Labels eje X -->
          <text v-for="xi in xTicks" :key="'tx'+xi"
            :x="PAD.left + (xi / 49) * innerW" :y="H - 6"
            text-anchor="middle" font-size="9" fill="#4a7a4a" font-family="Courier New">
            -{{ 49 - xi }}
          </text>

          <!-- Ejes -->
          <line :x1="PAD.left" :y1="PAD.top" :x2="PAD.left" :y2="PAD.top + innerH" stroke="#2a5a2a" stroke-width="1.5"/>
          <line :x1="PAD.left" :y1="PAD.top + innerH" :x2="PAD.left + innerW" :y2="PAD.top + innerH" stroke="#2a5a2a" stroke-width="1.5"/>
        </svg>
      </div>

      <!-- ── Tendencia Humedad ── -->
      <div class="chart-card">
        <div class="chart-title">
          <span class="dot-blue"></span> Humedad Relativa — últimas 50 mediciones
          <div class="chart-stats">
            <span>Prom: <strong>{{ avgHum }}%</strong></span>
            <span>Mín: <strong>{{ minHum }}%</strong></span>
            <span>Máx: <strong>{{ maxHum }}%</strong></span>
          </div>
        </div>
        <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stop-color="#38bdf8" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <line v-for="t in yTicks(20, 100)" :key="t.val"
            :x1="PAD.left" :y1="t.y" :x2="PAD.left + innerW" :y2="t.y"
            stroke="#1f3a1f" stroke-width="1" />
          <line v-for="xi in xTicks" :key="xi"
            :x1="PAD.left + (xi / 49) * innerW" :y1="PAD.top"
            :x2="PAD.left + (xi / 49) * innerW" :y2="PAD.top + innerH"
            stroke="#1f3a1f" stroke-width="1" />

          <path :d="area(histHum, 20, 100)" fill="url(#gradHum)" />
          <polyline
            :points="polyline(histHum, 20, 100)"
            fill="none" stroke="#38bdf8" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round"
          />

          <text v-for="t in yTicks(20, 100)" :key="'hy'+t.val"
            :x="PAD.left - 6" :y="t.y + 4"
            text-anchor="end" font-size="9" fill="#4a7a4a" font-family="Courier New">
            {{ t.val }}%
          </text>
          <text v-for="xi in xTicks" :key="'hx'+xi"
            :x="PAD.left + (xi / 49) * innerW" :y="H - 6"
            text-anchor="middle" font-size="9" fill="#4a7a4a" font-family="Courier New">
            -{{ 49 - xi }}
          </text>

          <line :x1="PAD.left" :y1="PAD.top" :x2="PAD.left" :y2="PAD.top + innerH" stroke="#2a5a2a" stroke-width="1.5"/>
          <line :x1="PAD.left" :y1="PAD.top + innerH" :x2="PAD.left + innerW" :y2="PAD.top + innerH" stroke="#2a5a2a" stroke-width="1.5"/>
        </svg>
      </div>

      <!-- ── Correlación Scatter ── -->
      <div class="chart-card chart-card--scatter">
        <div class="chart-title">
          <span class="dot-green"></span> Correlación Temperatura vs Humedad
          <div class="chart-stats">
            <span>Pearson r: <strong>{{ pearsonR }}</strong></span>
            <span>y = {{ regression.m }}x + {{ regression.b }}</span>
          </div>
        </div>

        <div class="scatter-wrap">
          <svg :viewBox="`0 0 ${SCATTER_W} ${SCATTER_H}`" class="chart-svg scatter-svg" preserveAspectRatio="xMidYMid meet">
            <!-- Grid -->
            <line v-for="t in yTicks(humMin, humMax)" :key="t.val"
              :x1="SP.left" :y1="t.y" :x2="SP.left + sInnerW" :y2="t.y"
              stroke="#1f3a1f" stroke-width="1" />

            <!-- Ejes -->
            <line :x1="SP.left" :y1="SP.top" :x2="SP.left" :y2="SP.top + sInnerH" stroke="#2a5a2a" stroke-width="1.5"/>
            <line :x1="SP.left" :y1="SP.top + sInnerH" :x2="SP.left + sInnerW" :y2="SP.top + sInnerH" stroke="#2a5a2a" stroke-width="1.5"/>

            <!-- Regresión -->
            <line
              :x1="regression.x1" :y1="regression.y1"
              :x2="regression.x2" :y2="regression.y2"
              stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"
            />

            <!-- Puntos -->
            <circle
              v-for="(pt, i) in scatterPoints" :key="i"
              :cx="pt.x" :cy="pt.y" r="3"
              fill="#ff8844" fill-opacity="0.65" stroke="#ff6622" stroke-width="0.5"
            />

            <!-- Labels eje Y -->
            <text v-for="t in yTicks(humMin, humMax)" :key="'sy'+t.val"
              :x="SP.left - 5" :y="t.y + 3"
              text-anchor="end" font-size="8" fill="#4a7a4a" font-family="Courier New">
              {{ t.val }}%
            </text>
            <!-- Labels eje X -->
            <text v-for="xi in [tempMin, (tempMin+tempMax)/2, tempMax]" :key="'sx'+xi"
              :x="SP.left + ((xi - tempMin) / (tempMax - tempMin)) * sInnerW"
              :y="SP.top + sInnerH + 14"
              text-anchor="middle" font-size="8" fill="#4a7a4a" font-family="Courier New">
              {{ Number(xi).toFixed(0) }}°
            </text>

            <!-- Etiquetas de ejes -->
            <text :x="SP.left + sInnerW / 2" :y="SCATTER_H - 2"
              text-anchor="middle" font-size="8" fill="#5a8a5a" font-family="Courier New">
              Temperatura (°C)
            </text>
            <text :x="9" :y="SP.top + sInnerH / 2"
              text-anchor="middle" font-size="8" fill="#5a8a5a" font-family="Courier New"
              :transform="`rotate(-90, 9, ${SP.top + sInnerH / 2})`">
              Humedad (%)
            </text>
          </svg>

          <!-- Leyenda correlación -->
          <div class="corr-legend">
            <div class="corr-row"><span class="corr-dot" style="background:#ff8844"></span> Medición</div>
            <div class="corr-row"><span class="corr-line"></span> Tendencia</div>
            <div class="corr-strength">
              Correlación:
              <strong :style="{ color: Math.abs(Number(pearsonR)) > 0.6 ? '#4ade80' : '#fbbf24' }">
                {{ Math.abs(Number(pearsonR)) > 0.7 ? 'Fuerte' : Math.abs(Number(pearsonR)) > 0.4 ? 'Moderada' : 'Débil' }}
              </strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.charts-section {
  padding: 2rem 5%;
  background: #090f09;
  border-top: 1px solid #1a301a;
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
}

.section-header h2 {
  font-family: 'Georgia', serif;
  color: #e8f5e8;
  font-size: 1.4rem;
  margin: 0;
}

.charts-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.4rem;
}

.chart-card {
  background: #111a11;
  border: 1px solid #1f3a1f;
  border-radius: 14px;
  padding: 1.2rem 1rem 0.8rem;
}

.chart-card--scatter {
  grid-column: 1 / -1;
}

.chart-title {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: #5a8a5a;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
  letter-spacing: 0.04em;
}

.chart-stats {
  margin-left: auto;
  display: flex;
  gap: 1rem;
  font-size: 0.68rem;
  color: #4a7a4a;
}

.chart-stats strong { color: #e8f5e8; }

.dot-red   { width: 8px; height: 8px; border-radius: 50%; background: #ff6644; display: inline-block; flex-shrink: 0; }
.dot-blue  { width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; display: inline-block; flex-shrink: 0; }
.dot-green { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; flex-shrink: 0; }

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Scatter layout */
.scatter-wrap {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.scatter-svg {
  flex: 1;
  max-width: 320px;
}

.corr-legend {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: #5a8a5a;
}

.corr-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.corr-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.corr-line {
  width: 20px; height: 2px;
  background: #4ade80;
  display: inline-block;
  opacity: 0.7;
}

.corr-strength {
  margin-top: 0.8rem;
  font-size: 0.8rem;
  color: #7aaa7a;
}

.corr-strength strong { font-size: 1rem; }

@media (max-width: 860px) {
  .charts-layout { grid-template-columns: 1fr; }
  .chart-card--scatter { grid-column: 1; }
  .scatter-wrap { flex-direction: column; align-items: flex-start; }
  .chart-stats { margin-left: 0; }
}
</style>