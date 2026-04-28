<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GemeloDigital3D from './components/GemeloDigital3d.vue'
import PanelSensores   from './components/PanelSensores.vue'
import PanelGraficos   from './components/PanelGraficos.vue'
import PanelCamara     from './components/PanelCamara.vue'
import './App.css'

// ─── Actuadores ──────────────────────────────────────────────────
const caloventorActivo = ref(false)
const caloventorCalor  = ref(false)
const ventiladorActivo = ref(true)
const coolerActivo     = ref(false)
const lamparaActiva    = ref(true)
const bombaActiva      = ref(false)
const cortinasAbiertas = ref(true)

// ─── Sensores (simulados) ─────────────────────────────────────────
const temperatura  = ref(24.3)
const humedadAire  = ref(62)
const humedadSuelo = ref(45)
const luminosidad  = ref(820)
const timestamp    = ref('')

// ─── Histórico – últimos 50 datos ────────────────────────────────
const histTemp = ref<number[]>([])
const histHum  = ref<number[]>([])

function initHistory() {
  let t = 23, h = 60
  for (let i = 0; i < 50; i++) {
    t = Math.max(14, Math.min(36, t + (Math.random() - 0.48) * 1.2))
    h = Math.max(30, Math.min(95, h + (Math.random() - 0.5) * 4 - (t - 23) * 0.6))
    histTemp.value.push(parseFloat(t.toFixed(1)))
    histHum.value.push(Math.round(h))
  }
}

function updateSensors() {
  const prevT = temperatura.value
  temperatura.value  = parseFloat(Math.max(10, Math.min(40,
    prevT + (Math.random() - 0.48) * 0.8
  )).toFixed(1))
  humedadAire.value  = Math.round(Math.max(20, Math.min(100,
    humedadAire.value + (Math.random() - 0.5) * 3 - (temperatura.value - 23) * 0.4
  )))
  humedadSuelo.value = Math.round(Math.max(10, Math.min(100,
    humedadSuelo.value + (bombaActiva.value ? 0.8 : -0.3) + (Math.random() - 0.5) * 1.5
  )))
  luminosidad.value = Math.round(Math.max(0, Math.min(1500,
    luminosidad.value + (Math.random() - 0.5) * 120
  )))

  histTemp.value.push(temperatura.value)
  histHum.value.push(humedadAire.value)
  if (histTemp.value.length > 50) histTemp.value.shift()
  if (histHum.value.length  > 50) histHum.value.shift()

  timestamp.value = new Date().toLocaleTimeString('es-AR')
}

let sensorInterval: ReturnType<typeof setInterval>
onMounted(() => {
  initHistory()
  updateSensors()
  sensorInterval = setInterval(updateSensors, 2500)
})
onUnmounted(() => clearInterval(sensorInterval))

// ─── Alertas ─────────────────────────────────────────────────────
const alertaTemp   = computed(() => temperatura.value  > 28 || temperatura.value  < 15)
const alertaHum    = computed(() => humedadAire.value  < 40 || humedadAire.value  > 85)
const alertaSuelo  = computed(() => humedadSuelo.value < 30)
const alertaLuz    = computed(() => luminosidad.value  < 200)
const totalAlertas = computed(() =>
  [alertaTemp.value, alertaHum.value, alertaSuelo.value, alertaLuz.value].filter(Boolean).length
)

// ─── Dispositivos ─────────────────────────────────────────────────
const dispositivos = computed(() => [
  {
    id: 'caloventor',
    icon: '🔥',
    nombre: 'Caloventor',
    detalle: caloventorActivo.value
      ? (caloventorCalor.value ? 'Modo CALEFACCIÓN' : 'Modo VENTILACIÓN')
      : 'Apagado',
    activo: caloventorActivo.value,
    toggle: () => { caloventorActivo.value = !caloventorActivo.value },
    extra: true,
    extraLabel: caloventorCalor.value ? 'Con Calor' : 'Sólo Ventila',
    extraToggle: () => { caloventorCalor.value = !caloventorCalor.value },
    extraDisabled: !caloventorActivo.value,
  },
  {
    id: 'ventilador',
    icon: '🌀',
    nombre: 'Ventilador Frontal',
    detalle: ventiladorActivo.value ? '1.1 m³/min · 70 m³/h' : 'Apagado',
    activo: ventiladorActivo.value,
    toggle: () => { ventiladorActivo.value = !ventiladorActivo.value },
    extra: false,
  },
  {
    id: 'cooler',
    icon: '❄️',
    nombre: 'Cooler PC',
    detalle: coolerActivo.value ? 'Refuerzo activo' : 'Apagado',
    activo: coolerActivo.value,
    toggle: () => { coolerActivo.value = !coolerActivo.value },
    extra: false,
  },
  {
    id: 'lampara',
    icon: '💡',
    nombre: 'Lámpara LED',
    detalle: lamparaActiva.value ? 'Iluminación activa' : 'Apagada',
    activo: lamparaActiva.value,
    toggle: () => { lamparaActiva.value = !lamparaActiva.value },
    extra: false,
  },
  {
    id: 'bomba',
    icon: '💧',
    nombre: 'Bomba 12V',
    detalle: bombaActiva.value ? 'Recirculando agua' : 'Apagada',
    activo: bombaActiva.value,
    toggle: () => { bombaActiva.value = !bombaActiva.value },
    extra: false,
  },
  {
    id: 'cortinas',
    icon: '🪟',
    nombre: 'Cortinas Enrollables',
    detalle: cortinasAbiertas.value ? 'Abiertas — 2/3 pared' : 'Cerradas',
    activo: cortinasAbiertas.value,
    toggle: () => { cortinasAbiertas.value = !cortinasAbiertas.value },
    extra: false,
    toggleLabel: cortinasAbiertas.value ? 'CERRAR' : 'ABRIR',
  },
])
</script>

<template>
  <div class="layout-wrapper">

    <!-- ═══════════════════════ NAVBAR ═══════════════════════════ -->
    <header class="navbar">
      <div class="logo">🌿 <span>Invernadero Digital</span></div>
      <nav class="nav-links">
        <a href="#">Dashboard</a>
        <a href="#">Monitoreo</a>
        <a href="#">Alertas
          <span v-if="totalAlertas > 0" class="alert-badge">{{ totalAlertas }}</span>
        </a>
      </nav>
    </header>

    <main class="main-container">

      <!-- ══════════════════════ TOP BAR ══════════════════════════ -->
      <section class="top-bar">
        <div class="status-indicator">
          <span class="dot" :class="{ 'dot-warn': totalAlertas > 0 }"></span>
          {{ totalAlertas === 0
            ? 'Sistema Nominal'
            : `${totalAlertas} Alerta${totalAlertas > 1 ? 's' : ''} Activa${totalAlertas > 1 ? 's' : ''}` }}
        </div>
        <h1 class="page-title">Gemelo Digital · Invernadero Experimental</h1>
        <div class="unrn-badge">UNRN · Lic. Sistemas · 2026</div>
      </section>

      <!-- ═══════════════════ SECCIÓN 1: GEMELO DIGITAL ═══════════════════ -->
      <section class="twin-section">
        <div class="twin-header">
          <span class="section-badge">GEMELO DIGITAL · 3D</span>
          <h2>Vista Interactiva del Invernadero</h2>
          <p>Arrastrá para orbitar · Scroll para zoom · Los colores reflejan el estado de cada dispositivo</p>
        </div>

        <div class="twin-layout">
          <div class="canvas-wrapper">
            <GemeloDigital3D
              :caloventor-activo="caloventorActivo"
              :caloventor-calor="caloventorCalor"
              :ventilador-activo="ventiladorActivo"
              :cooler-activo="coolerActivo"
              :lampara-activa="lamparaActiva"
              :bomba-activa="bombaActiva"
              :cortinas-abiertas="cortinasAbiertas"
              :temperatura="temperatura"
              :humedad-suelo="humedadSuelo"
              :luminosidad="luminosidad"
            />
          </div>

          <aside class="actuadores-panel">
            <div class="panel-title">⚙️ Control de Actuadores</div>

            <div
              v-for="disp in dispositivos"
              :key="disp.id"
              class="actuador-card"
              :class="{ 'is-active': disp.activo }"
            >
              <div class="actuador-top">
                <span class="actuador-icon">{{ disp.icon }}</span>
                <div class="actuador-info">
                  <div class="actuador-nombre">{{ disp.nombre }}</div>
                  <div class="actuador-detalle">{{ disp.detalle }}</div>
                </div>
                <button
                  class="toggle-btn"
                  :class="{ 'is-on': disp.activo }"
                  @click="disp.toggle()"
                >
                  {{ (disp as any).toggleLabel ?? (disp.activo ? 'APAGAR' : 'ENCENDER') }}
                </button>
              </div>
              <div v-if="disp.extra" class="actuador-extra">
                <button
                  class="mode-btn"
                  :class="{ 'is-on': caloventorCalor, 'is-disabled': !disp.activo }"
                  :disabled="!disp.activo"
                  @click="(disp as any).extraToggle()"
                >
                  {{ (disp as any).extraLabel }}
                </button>
              </div>
            </div>

            <div class="leyenda">
              <div class="leyenda-title">Leyenda 3D</div>
              <div class="leyenda-row"><span class="lc" style="background:#4ade80"></span> Normal / Activo</div>
              <div class="leyenda-row"><span class="lc" style="background:#ff6633"></span> Calor activo</div>
              <div class="leyenda-row"><span class="lc" style="background:#33aaff"></span> Ventilación activa</div>
              <div class="leyenda-row"><span class="lc" style="background:#ffee44"></span> Iluminación activa</div>
              <div class="leyenda-row"><span class="lc" style="background:#555555"></span> Dispositivo apagado</div>
            </div>
          </aside>
        </div>
      </section>

      <!-- ═══════════════════ SECCIÓN 2: CÁMARA ═══════════════════════ -->
      <PanelCamara />

      <!-- ═══════════════════ SECCIÓN 3: SENSORES ═════════════════════ -->
      <PanelSensores
        :temperatura="temperatura"
        :humedad-aire="humedadAire"
        :humedad-suelo="humedadSuelo"
        :luminosidad="luminosidad"
        :alerta-temp="alertaTemp"
        :alerta-hum="alertaHum"
        :alerta-suelo="alertaSuelo"
        :alerta-luz="alertaLuz"
        :timestamp="timestamp"
      />

      <!-- ═══════════════════ SECCIÓN 4: GRÁFICOS ══════════════════════ -->
      <PanelGraficos
        :hist-temp="histTemp"
        :hist-hum="histHum"
      />

    </main>

    <footer class="footer">
      <p>UNRN — Licenciatura en Sistemas — Gemelo Digital Invernadero Experimental · 2026</p>
    </footer>
  </div>
</template>