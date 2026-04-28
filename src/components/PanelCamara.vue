<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import './styles/PanelCamara.css'

// ─── Estado de la cámara ─────────────────────────────────────────
const videoRef       = ref<HTMLVideoElement | null>(null)
const stream         = ref<MediaStream | null>(null)
const camaraActiva   = ref(false)
const errorMsg       = ref('')
const cargando       = ref(false)
const urlStream      = ref('')
const modoConexion   = ref<'webcam' | 'url'>('webcam')
const urlInput       = ref('http://192.168.1.100:8080/video')  // IP cam default

// Lista de dispositivos de video disponibles
const dispositivos   = ref<MediaDeviceInfo[]>([])
const dispositivoSel = ref('')

async function cargarDispositivos() {
  try {
    const devs = await navigator.mediaDevices.enumerateDevices()
    dispositivos.value = devs.filter(d => d.kind === 'videoinput')
    if (dispositivos.value.length > 0 && dispositivos.value[0]) {
      dispositivoSel.value = dispositivos.value[0].deviceId
    }
  } catch {
    // Sin permisos aún — se listan después de obtener stream
  }
}

async function iniciarWebcam() {
  errorMsg.value  = ''
  cargando.value  = true
  try {
    const constraints: MediaStreamConstraints = {
      video: dispositivoSel.value
        ? { deviceId: { exact: dispositivoSel.value } }
        : { facingMode: 'environment' },
      audio: false,
    }
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      await videoRef.value.play()
    }
    camaraActiva.value = true
    // Re-enumerar con permisos concedidos
    await cargarDispositivos()
  } catch (e: unknown) {
    const err = e as Error
    if (err.name === 'NotAllowedError') {
      errorMsg.value = 'Permiso denegado. Habilitá el acceso a la cámara en tu navegador.'
    } else if (err.name === 'NotFoundError') {
      errorMsg.value = 'No se encontró ninguna cámara conectada.'
    } else {
      errorMsg.value = `Error al acceder a la cámara: ${err.message}`
    }
  } finally {
    cargando.value = false
  }
}

function iniciarURLStream() {
  errorMsg.value = ''
  if (!urlInput.value.trim()) {
    errorMsg.value = 'Ingresá una URL válida para el stream.'
    return
  }
  urlStream.value    = urlInput.value.trim()
  camaraActiva.value = true
}

function detenerCamara() {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
  urlStream.value    = ''
  camaraActiva.value = false
}

function onImgError() {
  errorMsg.value  = 'No se pudo conectar al stream de la cámara IP. Verificá la URL y que el dispositivo esté en red.'
  camaraActiva.value = false
  urlStream.value    = ''
}

onMounted(cargarDispositivos)
onUnmounted(detenerCamara)
</script>

<template>
  <section class="camara-section">
    <div class="camara-header">
      <div class="camara-header-left">
        <span class="section-badge">CÁMARA · EN VIVO</span>
        <h2>📷 Stream Interno del Invernadero</h2>
        <p>Visualización en tiempo real desde la cámara instalada en el interior</p>
      </div>
      <div class="camara-status" :class="{ 'is-live': camaraActiva }">
        <span class="live-dot"></span>
        {{ camaraActiva ? 'EN VIVO' : 'INACTIVO' }}
      </div>
    </div>

    <div class="camara-layout">

      <!-- ── Vista de video ── -->
      <div class="video-wrapper">

        <!-- Webcam / dispositivo local -->
        <video
          v-show="camaraActiva && modoConexion === 'webcam'"
          ref="videoRef"
          class="video-feed"
          playsinline
          muted
          autoplay
        ></video>

        <!-- Stream por URL (cámara IP / MJPEG) -->
        <img
          v-if="camaraActiva && modoConexion === 'url' && urlStream"
          :src="urlStream"
          class="video-feed"
          alt="Stream cámara IP"
          @error="onImgError"
        />

        <!-- Placeholder cuando está inactiva -->
        <div v-if="!camaraActiva" class="video-placeholder">
          <div class="placeholder-icon">📷</div>
          <p>Cámara sin señal</p>
          <span>Seleccioná un modo de conexión y presioná <strong>Iniciar</strong></span>
        </div>

        <!-- Overlay de carga -->
        <div v-if="cargando" class="video-loading">
          <div class="spinner"></div>
          <span>Conectando cámara...</span>
        </div>

        <!-- HUD superpuesto cuando está activa -->
        <div v-if="camaraActiva" class="video-hud">
          <div class="hud-top">
            <span class="hud-rec">● REC</span>
            <span class="hud-label">CAM-01 · INTERIOR</span>
          </div>
          <div class="hud-bottom">
            <span>{{ new Date().toLocaleString('es-AR') }}</span>
            <span>INVERNADERO DIGITAL · UNRN</span>
          </div>
        </div>
      </div>

      <!-- ── Panel de control de cámara ── -->
      <div class="camara-controls">
        <div class="control-title">Configuración de Cámara</div>

        <!-- Selector de modo -->
        <div class="mode-selector">
          <button
            class="mode-tab"
            :class="{ active: modoConexion === 'webcam' }"
            @click="modoConexion = 'webcam'; detenerCamara()"
          >
            💻 Webcam / USB
          </button>
          <button
            class="mode-tab"
            :class="{ active: modoConexion === 'url' }"
            @click="modoConexion = 'url'; detenerCamara()"
          >
            🌐 Cámara IP / URL
          </button>
        </div>

        <!-- Modo Webcam -->
        <div v-if="modoConexion === 'webcam'" class="control-group">
          <label class="control-label">Dispositivo de video</label>
          <select v-model="dispositivoSel" class="control-select" :disabled="camaraActiva">
            <option
              v-for="dev in dispositivos"
              :key="dev.deviceId"
              :value="dev.deviceId"
            >
              {{ dev.label || `Cámara ${dispositivos.indexOf(dev) + 1}` }}
            </option>
            <option v-if="dispositivos.length === 0" value="">
              Sin dispositivos detectados
            </option>
          </select>
          <p class="control-hint">
            Si no aparecen dispositivos, presioná <em>Iniciar</em> para solicitar permisos.
          </p>
        </div>

        <!-- Modo URL / IP Cam -->
        <div v-if="modoConexion === 'url'" class="control-group">
          <label class="control-label">URL del stream (MJPEG / HTTP)</label>
          <input
            v-model="urlInput"
            type="text"
            class="control-input"
            placeholder="http://192.168.x.x:8080/video"
            :disabled="camaraActiva"
          />
          <p class="control-hint">
            Compatible con streams MJPEG, cámaras IP y apps como <em>IP Webcam</em> (Android).
          </p>
        </div>

        <!-- Botones acción -->
        <div class="control-actions">
          <button
            v-if="!camaraActiva"
            class="btn-iniciar"
            :disabled="cargando"
            @click="modoConexion === 'webcam' ? iniciarWebcam() : iniciarURLStream()"
          >
            {{ cargando ? 'Conectando...' : '▶ Iniciar stream' }}
          </button>
          <button
            v-else
            class="btn-detener"
            @click="detenerCamara()"
          >
            ■ Detener
          </button>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="camara-error">
          ⚠ {{ errorMsg }}
        </div>

        <!-- Info -->
        <div class="camara-info">
          <div class="info-row">
            <span class="info-key">Estado</span>
            <span class="info-val" :class="{ live: camaraActiva }">
              {{ camaraActiva ? 'Transmitiendo' : 'Detenida' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-key">Modo</span>
            <span class="info-val">{{ modoConexion === 'webcam' ? 'Webcam / USB' : 'Cámara IP / URL' }}</span>
          </div>
          <div class="info-row">
            <span class="info-key">Cámara</span>
            <span class="info-val">CAM-01 · Interior</span>
          </div>
          <div class="info-row">
            <span class="info-key">Ubicación</span>
            <span class="info-val">Invernadero — zona central</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>