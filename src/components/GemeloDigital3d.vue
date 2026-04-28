<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Stars } from '@tresjs/cientos'
import { computed } from 'vue'

const props = defineProps<{
  caloventorActivo: boolean
  caloventorCalor : boolean
  ventiladorActivo: boolean
  coolerActivo    : boolean
  lamparaActiva   : boolean
  bombaActiva     : boolean
  cortinasAbiertas: boolean
  temperatura     : number
  humedadSuelo    : number
  luminosidad     : number
}>()

// ─── Geometría ────────────────────────────────────────────────────
const paredFrenteArgs = [4, 3, 0.08]   as const
const paredLadoArgs   = [0.08, 3, 7]   as const
const techoPanelArgs  = [2.2, 0.06, 7] as const
const gridArgs        = [14, 14]        as const

// ─── Colores reactivos ────────────────────────────────────────────
const colorCaloventor = computed(() => {
  if (!props.caloventorActivo) return '#555555'
  return props.caloventorCalor ? '#ff6633' : '#33aaff'
})
const colorVentilador = computed(() => props.ventiladorActivo ? '#00ddff' : '#555555')
const colorCooler     = computed(() => props.coolerActivo     ? '#88eeff' : '#555555')
const colorLampara    = computed(() => props.lamparaActiva    ? '#ffee44' : '#444444')
const colorBomba      = computed(() => props.bombaActiva      ? '#44aaff' : '#555555')

// ─── Intensidades emissive ────────────────────────────────────────
const emCaloventor = computed(() => props.caloventorActivo ? 0.6 : 0)
const emVentilador = computed(() => props.ventiladorActivo ? 0.5 : 0)
const emCooler     = computed(() => props.coolerActivo     ? 0.4 : 0)
const emLampara    = computed(() => props.lamparaActiva    ? 0.8 : 0)
const emBomba      = computed(() => props.bombaActiva      ? 0.5 : 0)

// ─── Cortinas ─────────────────────────────────────────────────────
const cortinaPosY   = computed(() => props.cortinasAbiertas ? 2.5  : 1.5)
const cortinaScaleY = computed(() => props.cortinasAbiertas ? 0.33 : 1.0)

// ─── Iluminación ─────────────────────────────────────────────────
const ambientIntensity = computed(() => {
  if (props.temperatura > 30) return 0.8
  if (props.temperatura < 15) return 0.3
  return 0.5
})
const lampIntensity = computed(() => props.lamparaActiva ? 1.8 : 0)

// ─── Computeds locales para evitar acceso directo a props en template ──
const lamparaActiva = computed(() => props.lamparaActiva)
const bombaActiva   = computed(() => props.bombaActiva)
</script>

<template>
  <TresCanvas clear-color="#060d06" shadows alpha>
    <TresPerspectiveCamera :position="[10, 8, 10]" :fov="55" />
    <OrbitControls :min-distance="4" :max-distance="25" />
    <Stars :radius="80" :depth="40" :count="3000" :factor="3" :saturation="0" fade :speed="0.5" />

    <!-- Iluminación global -->
    <TresAmbientLight :intensity="ambientIntensity" color="#c8f0c8" />
    <TresDirectionalLight :position="[8, 12, 6]" :intensity="0.7" color="#ffffff" cast-shadow />

    <!-- Luz de lámpara LED -->
    <TresPointLight
      v-if="lamparaActiva"
      :position="[0, 2.6, 0]"
      :intensity="lampIntensity"
      color="#fffaaa"
      :distance="8"
    />

    <!-- ══ ESTRUCTURA ══ -->

    <!-- Piso -->
    <TresMesh :position="[0, 0, 0]" receive-shadow>
      <TresBoxGeometry :args="[4.1, 0.08, 7.1]" />
      <TresMeshStandardMaterial color="#1a3a1a" :roughness="0.9" />
    </TresMesh>

    <!-- Pared Frente -->
    <TresMesh :position="[0, 1.5, -3.5]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="paredFrenteArgs" />
      <TresMeshStandardMaterial color="#1e4a1e" :transparent="true" :opacity="0.55" :roughness="0.4" />
    </TresMesh>

    <!-- Pared Fondo -->
    <TresMesh :position="[0, 1.5, 3.5]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="paredFrenteArgs" />
      <TresMeshStandardMaterial color="#1e4a1e" :transparent="true" :opacity="0.55" :roughness="0.4" />
    </TresMesh>

    <!-- Pared Izquierda -->
    <TresMesh :position="[-2, 1.5, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="paredLadoArgs" />
      <TresMeshStandardMaterial color="#1e4a1e" :transparent="true" :opacity="0.45" :roughness="0.4" />
    </TresMesh>

    <!-- Pared Derecha -->
    <TresMesh :position="[2, 1.5, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="paredLadoArgs" />
      <TresMeshStandardMaterial color="#1e4a1e" :transparent="true" :opacity="0.45" :roughness="0.4" />
    </TresMesh>

    <!-- Techo izquierdo -->
    <TresMesh :position="[-1.0, 3.35, 0]" :rotation="[0, 0, 0.42]" cast-shadow>
      <TresBoxGeometry :args="techoPanelArgs" />
      <TresMeshStandardMaterial color="#2a5a2a" :transparent="true" :opacity="0.6" :roughness="0.3" />
    </TresMesh>

    <!-- Techo derecho -->
    <TresMesh :position="[1.0, 3.35, 0]" :rotation="[0, 0, -0.42]" cast-shadow>
      <TresBoxGeometry :args="techoPanelArgs" />
      <TresMeshStandardMaterial color="#2a5a2a" :transparent="true" :opacity="0.6" :roughness="0.3" />
    </TresMesh>

    <!-- Caballete -->
    <TresMesh :position="[0, 3.85, 0]">
      <TresBoxGeometry :args="[0.15, 0.15, 7]" />
      <TresMeshStandardMaterial color="#3a6a3a" />
    </TresMesh>

    <!-- ══ CORTINAS ══ -->
    <TresMesh :position="[-2.04, cortinaPosY, 0]" :scale="[1, cortinaScaleY, 1]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 3, 6.8]" />
      <TresMeshStandardMaterial color="#8B6914" :roughness="0.8" />
    </TresMesh>
    <TresMesh :position="[2.04, cortinaPosY, 0]" :scale="[1, cortinaScaleY, 1]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 3, 6.8]" />
      <TresMeshStandardMaterial color="#8B6914" :roughness="0.8" />
    </TresMesh>

    <!-- ══ LÁMPARA LED ══ -->
    <TresMesh :position="[0, 3.1, 0]" cast-shadow>
      <TresBoxGeometry :args="[1.8, 0.12, 0.22]" />
      <TresMeshStandardMaterial :color="colorLampara" :emissive="colorLampara" :emissive-intensity="emLampara" :roughness="0.2" />
    </TresMesh>
    <TresMesh :position="[0, 3.4, 0]">
      <TresBoxGeometry :args="[0.05, 0.3, 0.05]" />
      <TresMeshStandardMaterial color="#888888" />
    </TresMesh>

    <!-- ══ VENTILADOR FRONTAL ══ -->
    <TresMesh :position="[0, 2.2, -3.46]" cast-shadow>
      <TresCylinderGeometry :args="[0.35, 0.35, 0.12, 24]" />
      <TresMeshStandardMaterial :color="colorVentilador" :emissive="colorVentilador" :emissive-intensity="emVentilador" :roughness="0.3" />
    </TresMesh>
    <TresMesh :position="[0, 2.2, -3.38]" :rotation="[Math.PI/2, 0, 0]">
      <TresBoxGeometry :args="[0.55, 0.04, 0.12]" />
      <TresMeshStandardMaterial :color="colorVentilador" :emissive="colorVentilador" :emissive-intensity="emVentilador * 0.5" />
    </TresMesh>
    <TresMesh :position="[0, 2.2, -3.38]" :rotation="[Math.PI/2, Math.PI/2, 0]">
      <TresBoxGeometry :args="[0.55, 0.04, 0.12]" />
      <TresMeshStandardMaterial :color="colorVentilador" :emissive="colorVentilador" :emissive-intensity="emVentilador * 0.5" />
    </TresMesh>

    <!-- ══ COOLER PC ══ -->
    <TresMesh :position="[1.96, 1.0, 2.5]" cast-shadow>
      <TresBoxGeometry :args="[0.08, 0.25, 0.25]" />
      <TresMeshStandardMaterial :color="colorCooler" :emissive="colorCooler" :emissive-intensity="emCooler" :roughness="0.2" />
    </TresMesh>

    <!-- ══ CALOVENTOR ══ -->
    <TresMesh :position="[1.2, 0.4, 3.44]" cast-shadow>
      <TresBoxGeometry :args="[0.9, 0.7, 0.08]" />
      <TresMeshStandardMaterial :color="colorCaloventor" :emissive="colorCaloventor" :emissive-intensity="emCaloventor" :roughness="0.4" />
    </TresMesh>
    <TresMesh :position="[1.2, 0.4, 3.47]">
      <TresBoxGeometry :args="[0.85, 0.65, 0.02]" />
      <TresMeshStandardMaterial color="#333333" :roughness="0.9" :wireframe="true" />
    </TresMesh>

    <!-- ══ BOMBA + SISTEMA EVAPORADOR ══ -->
    <TresMesh :position="[-1.5, 0.22, 3.0]" cast-shadow>
      <TresBoxGeometry :args="[0.5, 0.4, 0.5]" />
      <TresMeshStandardMaterial color="#1a4a6a" :transparent="true" :opacity="0.8" :roughness="0.2" />
    </TresMesh>
    <TresMesh :position="[-1.5, 0.25, 3.45]" cast-shadow>
      <TresCylinderGeometry :args="[0.1, 0.1, 0.25, 12]" />
      <TresMeshStandardMaterial :color="colorBomba" :emissive="colorBomba" :emissive-intensity="emBomba" :roughness="0.3" />
    </TresMesh>
    <TresMesh :position="[-1.96, 1.5, 3.0]" cast-shadow>
      <TresBoxGeometry :args="[0.06, 2.0, 0.8]" />
      <TresMeshStandardMaterial
        :color="bombaActiva ? '#44aaff' : '#aaaaaa'"
        :transparent="true"
        :opacity="bombaActiva ? 0.7 : 0.3"
        :roughness="0.1"
      />
    </TresMesh>

    <!-- ══ SENSORES ══ -->
    <!-- Temperatura -->
    <TresMesh :position="[-0.8, 1.2, -3.44]">
      <TresBoxGeometry :args="[0.14, 0.24, 0.06]" />
      <TresMeshStandardMaterial color="#ff4444" :emissive="'#ff2222'" :emissive-intensity="0.5" />
    </TresMesh>
    <!-- Humedad suelo -->
    <TresMesh :position="[0.8, 0.12, 1.5]">
      <TresCylinderGeometry :args="[0.04, 0.04, 0.35, 8]" />
      <TresMeshStandardMaterial color="#cc8800" :emissive="'#aa6600'" :emissive-intensity="0.4" />
    </TresMesh>
    <!-- Luminosidad -->
    <TresMesh :position="[0.8, 2.9, -2.0]">
      <TresSphereGeometry :args="[0.1, 12, 12]" />
      <TresMeshStandardMaterial color="#ffdd00" :emissive="'#ffbb00'" :emissive-intensity="0.6" />
    </TresMesh>

    <!-- Grid de piso -->
    <TresGridHelper :args="gridArgs" :position="[0, 0.05, 0]" />
  </TresCanvas>
</template>