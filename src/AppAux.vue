<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GemeloDigital3D  from './components/Gemelodigital3d.vue'
import PanelSensores    from './components/Panelsensores.vue'
import PanelGraficos    from './components/PanelGraficos.vue'

// ─── Actuadores ──────────────────────────────────────────────────
const caloventorActivo  = ref(false)
const caloventorCalor   = ref(false)   // false = sólo ventila, true = con calor
const ventiladorActivo  = ref(true)
const coolerActivo      = ref(false)
const lamparaActiva     = ref(true)
const bombaActiva       = ref(false)
const cortinasAbiertas  = ref(true)

// ─── Sensores (simulados con variación realista) ──────────────────
const temperatura  = ref(24.3)
const humedadAire  = ref(62)
const humedadSuelo = ref(45)
const luminosidad  = ref(820)
const timestamp    = ref('')

// Histórico – últimos 50 datos
const histTemp = ref<number[]>([])
const histHum  = ref<number[]>([])

function initHistory() {
  // Semilla realista para los 50 puntos iniciales
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
  luminosidad.value  = Math.round(Math.max(0, Math.min(1500,
    luminosidad.value + (Math.random() - 0.5) * 120
  )))

  // Push al histórico
  histTemp.value.push(temperatura.value)
  histHum.value.push(humedadAire.value)
  if (histTemp.value.length > 50) histTemp.value.shift()
  if (histHum.value.length  > 50) histHum.value.shift()

  // Timestamp
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
const alertaTemp  = computed(() => temperatura.value  > 28 || temperatura.value  < 15)
const alertaHum   = computed(() => humedadAire.value  < 40 || humedadAire.value  > 85)
const alertaSuelo = computed(() => humedadSuelo.value < 30)
const alertaLuz   = computed(() => luminosidad.value  < 200)
const totalAlertas = computed(() =>
  [alertaTemp.value, alertaHum.value, alertaSuelo.value, alertaLuz.value].filter(Boolean).length
)

// ─── Dispositivos: config de display ─────────────────────────────
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

    <!-- ══════════════════════ NAVBAR ══════════════════════════ -->
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
          <span class="dot" :class="{'dot-warn': totalAlertas > 0 }"></span>
          {{ totalAlertas === 0 ? 'Sistema Nominal' : `${totalAlertas} Alerta${totalAlertas > 1 ? 's' : ''} Activa${totalAlertas > 1 ? 's' : ''}` }}
        </div>
        <h1 class="page-title">Gemelo Digital · Invernadero Experimental</h1>
        <div class="unrn-badge">UNRN · Lic. Sistemas · 2026</div>
      </section>

      <!-- ══════════════════ SECCIÓN 1: GEMELO DIGITAL ══════════════════ -->
      <section class="twin-section">
        <div class="twin-header">
          <div class="twin-header-left">
            <span class="section-badge">GEMELO DIGITAL · 3D</span>
            <h2>Vista Interactiva del Invernadero</h2>
            <p>Arrastrá para orbitar · Scroll para zoom · Los colores reflejan el estado de cada dispositivo</p>
          </div>
        </div>

        <div class="twin-layout">
          <!-- Canvas 3D -->
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

          <!-- Panel de Actuadores (lateral) -->
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
              <!-- Extra toggle (caloventor: modo calor/ventila) -->
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

            <!-- Leyenda colores 3D -->
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

      <!-- ══════════════════ SECCIÓN 2: SENSORES ══════════════════ -->
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

      <!-- ══════════════════ SECCIÓN 3: GRÁFICOS ══════════════════ -->
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

<style>
/* ─── Reset & Base ──────────────────────────────────────────────── */
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green-primary: #4ade80;
  --green-dark: #0e1a0e;
  --green-mid:  #1f3a1f;
  --text-primary: #e8f5e8;
  --text-muted:   #5a8a5a;
  --accent-red:   #ff4444;
  --accent-blue:  #38bdf8;
}

body {
  background: #060d06;
  color: var(--text-primary);
  font-family: 'Georgia', 'Times New Roman', serif;
  min-height: 100vh;
}

#app { padding: 0; max-width: unset; text-align: left; }

/* ─── Navbar ─────────────────────────────────────────────────────── */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 5%;
  background: #0a140a;
  border-bottom: 1px solid var(--green-mid);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.logo {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--green-primary);
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--green-primary); }

.alert-badge {
  position: absolute;
  top: -6px; right: -10px;
  background: var(--accent-red);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  width: 14px; height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Top Bar ────────────────────────────────────────────────────── */
.top-bar {
  padding: 1.2rem 5%;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  background: #080e08;
  border-bottom: 1px solid #0f1f0f;
}

.status-indicator {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  background: #0f1f0f;
  border: 1px solid var(--green-mid);
  padding: 5px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.06em;
}

.dot {
  width: 8px; height: 8px;
  background: var(--green-primary);
  border-radius: 50%;
  animation: pulse 2s ease infinite;
  flex-shrink: 0;
}

.dot-warn {
  background: var(--accent-red);
  animation: pulse-red 1s ease infinite;
}

@keyframes pulse     { 0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,.4); } 50% { box-shadow: 0 0 0 6px rgba(74,222,128,0); } }
@keyframes pulse-red { 0%,100% { box-shadow: 0 0 0 0 rgba(255,68,68,.5); }  50% { box-shadow: 0 0 0 6px rgba(255,68,68,0); } }

.page-title {
  font-family: 'Georgia', serif;
  font-size: 1.2rem;
  font-weight: normal;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.unrn-badge {
  margin-left: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  color: #3a5a3a;
  letter-spacing: 0.06em;
}

/* ─── Twin Section ───────────────────────────────────────────────── */
.twin-section {
  background: #071007;
  background: #070e07;
  border-bottom: 1px solid var(--green-mid);
}

.twin-header {
  padding: 1.4rem 5% 0.8rem;
}

.section-badge {
  display: inline-block;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--green-primary);
  background: #0a2a0a;
  border: 1px solid #2a5a2a;
  padding: 3px 10px;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.twin-header h2 {
  font-family: 'Georgia', serif;
  font-size: 1.35rem;
  color: var(--text-primary);
  font-weight: normal;
  margin-bottom: 0.3rem;
}

.twin-header p {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: var(--text-muted);
  letter-spacing: 0.03em;
}

.twin-layout {
  display: flex;
  flex-direction: row;
  height: 62vh;
  min-height: 400px;
}

.canvas-wrapper {
  flex: 1;
  background: #050a05;
  overflow: hidden;
}

/* ─── Actuadores Panel ───────────────────────────────────────────── */
.actuadores-panel {
  width: 300px;
  flex-shrink: 0;
  background: #0c180c;
  border-left: 1px solid var(--green-mid);
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.panel-title {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--green-mid);
  margin-bottom: 0.2rem;
}

.actuador-card {
  background: #111c11;
  border: 1px solid #1a2e1a;
  border-radius: 10px;
  padding: 0.75rem;
  transition: all 0.25s ease;
}

.actuador-card.is-active {
  border-color: #2a5a2a;
  background: #0d1e0d;
  box-shadow: 0 0 12px rgba(74,222,128,0.06);
}

.actuador-top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.actuador-icon { font-size: 1.3rem; flex-shrink: 0; }

.actuador-info { flex: 1; min-width: 0; }

.actuador-nombre {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actuador-detalle {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.is-active .actuador-detalle { color: var(--green-primary); }

.toggle-btn {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #2a4a2a;
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  background: #1a2a1a;
  color: #5a8a5a;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.toggle-btn.is-on {
  background: #1a3a1a;
  border-color: var(--green-primary);
  color: var(--green-primary);
}

.toggle-btn:hover { opacity: 0.8; }

.actuador-extra {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #1a2e1a;
}

.mode-btn {
  width: 100%;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #333;
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  background: #1a1a1a;
  color: #777;
  transition: all 0.2s;
  letter-spacing: 0.06em;
}

.mode-btn.is-on {
  background: #2a1a0a;
  border-color: #ff6633;
  color: #ff8855;
}

.mode-btn.is-disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Leyenda */
.leyenda {
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid var(--green-mid);
}

.leyenda-title {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: #3a5a3a;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.leyenda-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  color: #4a7a4a;
  margin-bottom: 3px;
}

.lc {
  width: 10px; height: 10px;
  border-radius: 3px;
  display: inline-block;
  flex-shrink: 0;
}

/* ─── Footer ─────────────────────────────────────────────────────── */
.footer {
  padding: 1.2rem;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  color: #2a4a2a;
  border-top: 1px solid #0f2a0f;
  background: #050a05;
  letter-spacing: 0.06em;
}

/* ─── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .twin-layout {
    flex-direction: column;
    height: auto;
  }
  .canvas-wrapper { height: 50vh; }
  .actuadores-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--green-mid);
    max-height: 380px;
  }
  .page-title { font-size: 1rem; }
  .unrn-badge { display: none; }
}

@media (max-width: 540px) {
  .nav-links { gap: 1rem; }
  .top-bar { gap: 0.8rem; }
}
</style>