<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const contenedor3D = ref<HTMLElement | null>(null)
const modeloContenedor = ref<HTMLElement | null>(null)

const modeloCargado = ref(false)

// ESTADO REACTIVO (inician en 0 / false como fallback si no hay backend)
const datosInvernadero = ref({
  temperatura: 0,
  humedadSuelo: 0,
  humedadAire: 0,
  luminosidad: 0,
  caloventorActivo: false,
  ventanalesAbiertos: false,
  persianasEnrolladas: false,
  humidificadorActivo: false,
  bombaActiva: false
})

// Función para reiniciar datos si se pierde la conexión
const resetearDatos = () => {
  datosInvernadero.value.temperatura = 0
  datosInvernadero.value.humedadSuelo = 0
  datosInvernadero.value.humedadAire = 0
  datosInvernadero.value.luminosidad = 0
  datosInvernadero.value.caloventorActivo = false
  datosInvernadero.value.ventanalesAbiertos = false
  datosInvernadero.value.persianasEnrolladas = false
  datosInvernadero.value.humidificadorActivo = false
  datosInvernadero.value.bombaActiva = false
}

// Colores centralizados (Formato String Hexadecimal)
const COLORES_GEMELO = {
  VERDE_OPERATIVO: '#28a745',
  AZUL_ACTIVO: '#007bff',
  GRIS_INACTIVO: '#6c757d',
  ROJO_FALLA: '#dc3545',
  
  ESTRUCTURA: '#f4f6f9',
  TIERRA: '#8B5A2B'
}

let stompClient: Client

// Variables globales de Three.js
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId: number

let materialCaloventor: THREE.MeshStandardMaterial | undefined
let materialHumidificador: THREE.MeshStandardMaterial | undefined
let materialBombaDeAgua: THREE.MeshStandardMaterial | undefined

let materialTierra: THREE.MeshStandardMaterial | undefined

const ventanasMeshes: THREE.Object3D[] = []
const persianasMeshes: THREE.Object3D[] = []

const escalasInicialesPersianas = new Map<string, number>()

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    modeloContenedor.value?.requestFullscreen().catch(err => {
      console.error(`Error al intentar modo pantalla completa: ${err.message}`)
    })
  } else {
    document.exitFullscreen()
  }
}

const initThreeJS = () => {
  if (!contenedor3D.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf4f4f5)

  const width = contenedor3D.value.clientWidth || window.innerWidth
  const height = contenedor3D.value.clientHeight || 500

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 2, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  contenedor3D.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true 
  controls.dampingFactor = 0.05

  const luzDireccional = new THREE.DirectionalLight(0xffffff, 1)
  luzDireccional.position.set(5, 10, 5)
  scene.add(luzDireccional)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))

  const loader = new GLTFLoader()
  loader.load('/invernadero.glb', (gltf) => {
    const modelo = gltf.scene

    modelo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        
        if (mesh.material) {
          const materiales = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          materiales.forEach(mat => {
            mat.side = THREE.DoubleSide
            if (mat.opacity < 1) {
              mat.transparent = true
              mat.depthWrite = false 
              mat.needsUpdate = true
            }
          })
        }

        // Asignacion de materiales del modelo 3D
        if (mesh.material && !Array.isArray(mesh.material)) {
          
          if (mesh.material.name === 'Material_Caloventor') {
            materialCaloventor = mesh.material as THREE.MeshStandardMaterial
            actualizarColorCaloventor()
          }
          
          if (mesh.material.name === 'Material_Humidificador') {
            materialHumidificador = mesh.material as THREE.MeshStandardMaterial
            actualizarColorHumidificador()
          }

          if (mesh.material.name === 'Bomba_de_agua') {
            materialBombaDeAgua = mesh.material as THREE.MeshStandardMaterial
            actualizarColorBombaDeAgua()
          }

          if (mesh.name.toLowerCase().includes('ventanal')) {
            ventanasMeshes.push(mesh)
          }

          if (mesh.name.toLowerCase().includes('persiana')) {
            persianasMeshes.push(mesh)
            escalasInicialesPersianas.set(mesh.uuid, mesh.scale.y)
          }

          if(mesh.name.toLowerCase().includes('Tierra')){
            materialTierra = mesh.material as THREE.MeshStandardMaterial
            materialTierra.color.set('#8B5A2B')
          }
        }
      }
    })

    modelo.position.set(0, -1, 0)
    scene.add(modelo)
    
    modeloCargado.value = true
  }, undefined, (error) => {
    console.error('Error al cargar el modelo GLB:', error)
    modeloCargado.value = true 
  })

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    
    ventanasMeshes.forEach(ventana => {
      const nombreVentana = ventana.name.toLowerCase()
      const esLadoDerecho = nombreVentana.includes('derecho')
      const esLadoIzquierdo = nombreVentana.includes('izquierdo')

      let rotacionObjetivo = 0
      if (esLadoIzquierdo) {
        rotacionObjetivo = !datosInvernadero.value.ventanalesAbiertos ? Math.PI*(-0.25) : 0
      } else if (esLadoDerecho) {
        rotacionObjetivo = !datosInvernadero.value.ventanalesAbiertos ? Math.PI + Math.PI / 4 : Math.PI
      }

      ventana.rotation.x = THREE.MathUtils.lerp(ventana.rotation.x, rotacionObjetivo, 0.05)

      persianasMeshes.forEach(persiana => {
        const escalaOriginal = escalasInicialesPersianas.get(persiana.uuid) || 1
        const escalaObjetivo = datosInvernadero.value.persianasEnrolladas ? (escalaOriginal * 0.05) : escalaOriginal
        persiana.scale.z = THREE.MathUtils.lerp(persiana.scale.z, escalaObjetivo, 0.05)
      })
    })

    controls.update()
    renderer.render(scene, camera)
  }
  
  animate()
}

// CAMBIO DE ESTADOS DE ACTUADORES
const actualizarColorCaloventor = () => {
  if (materialCaloventor) {
    const color = datosInvernadero.value.caloventorActivo ? COLORES_GEMELO.AZUL_ACTIVO : COLORES_GEMELO.GRIS_INACTIVO
    materialCaloventor.color.set(color)
  }
}

const actualizarColorHumidificador = () => {
  if (materialHumidificador) {
    const color = datosInvernadero.value.humidificadorActivo ? COLORES_GEMELO.AZUL_ACTIVO : COLORES_GEMELO.GRIS_INACTIVO
    materialHumidificador.color.set(color)
  }
}

const actualizarColorBombaDeAgua = () => {
  if (materialBombaDeAgua) {
    const color = datosInvernadero.value.bombaActiva ? COLORES_GEMELO.AZUL_ACTIVO : COLORES_GEMELO.GRIS_INACTIVO
    materialBombaDeAgua.color.set(color)
  }
}

// Reactividad: Si los valores cambian, actualiza los materiales
watch(() => datosInvernadero.value.caloventorActivo, actualizarColorCaloventor)
watch(() => datosInvernadero.value.humidificadorActivo, actualizarColorHumidificador)
watch(() => datosInvernadero.value.bombaActiva, actualizarColorBombaDeAgua)

const handleResize = () => {
  if (contenedor3D.value && camera && renderer) {
    const width = contenedor3D.value.clientWidth
    const height = contenedor3D.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
}

onMounted(() => {
  initThreeJS()
  window.addEventListener('resize', handleResize)

  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws-invernadero'),
    onConnect: (frame) => {
      console.log('Conectado a Spring Boot (ThreeJS Component): ' + frame)
      stompClient.subscribe('/topic/sensores', (message) => {
        if (message.body) {
          const datosServer = JSON.parse(message.body)
          if (datosServer.temperatura !== undefined) datosInvernadero.value.temperatura = datosServer.temperatura
          if (datosServer.humedadSuelo !== undefined) datosInvernadero.value.humedadSuelo = datosServer.humedadSuelo
          if (datosServer.humedadAire !== undefined) datosInvernadero.value.humedadAire = datosServer.humedadAire
          if (datosServer.luminosidad !== undefined) datosInvernadero.value.luminosidad = datosServer.luminosidad
          if (datosServer.caloventorActivo !== undefined) datosInvernadero.value.caloventorActivo = datosServer.caloventorActivo
          if (datosServer.ventanalesAbiertos !== undefined) datosInvernadero.value.ventanalesAbiertos = datosServer.ventanalesAbiertos
          if (datosServer.persianasEnrolladas !== undefined) datosInvernadero.value.persianasEnrolladas = datosServer.persianasEnrolladas
          if (datosServer.humidificadorActivo !== undefined) datosInvernadero.value.humidificadorActivo = datosServer.humidificadorActivo
        }
      })
    },
    
    onWebSocketClose: () => {
      console.warn('Desconectado del backend. Valores restablecidos a 0.')
      resetearDatos()
    },
    onStompError: (frame) => {
      console.error('Error de STOMP en modelo 3D:', frame.headers['message'])
      resetearDatos()
    }
  })

  stompClient.activate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (stompClient) stompClient.deactivate()
  cancelAnimationFrame(animationFrameId)
  if (renderer) renderer.dispose()
})

defineExpose({
  datosInvernadero
})
</script>

<template>
  <div class="content-header">
    <div class="container-fluid">
      <div class="row mb-2 mt-2">
        <div class="col-sm-6">
          <h1 class="m-0 text-dark font-weight-bold">Monitoreo en Tiempo Real</h1>
        </div>
      </div>
    </div>
  </div>
  <div class="row mt-3">
    <div class="col-lg-3 col-md-4">
      <!-- Tarjetas de sensores -->
      <!-- Temperatura -->
      <div class="small-box bg-success shadow-sm mb-3">
        <div class="inner">
          <h3>{{ datosInvernadero.temperatura.toFixed(1) }}<sup style="font-size: 20px">°C</sup></h3>
          <p>Temperatura Interior</p>
        </div>
        <div class="icon">
          <i class="fas fa-thermometer-half"></i>
        </div>
      </div>
      
      <!-- Humedad -->
      <div class="small-box bg-white border border-success shadow-sm mb-3">
        <div class="inner text-success">
          <h3>{{ datosInvernadero.humedadAire.toFixed(1) }}<sup style="font-size: 20px">%</sup></h3>
          <p class="text-dark font-weight-bold">Humedad del Aire</p>
        </div>
        <div class="icon">
          <i class="fas fa-tint text-success"></i>
        </div>
      </div>

      <!-- Iluminación -->
      <div class="small-box bg-success shadow-sm mb-4">
        <div class="inner">
          <h3>{{ datosInvernadero.luminosidad }}<sup style="font-size: 20px"> Lux</sup></h3>
          <p>Luminosidad</p>
        </div>
        <div class="icon">
          <i class="fas fa-sun"></i>
        </div>
      </div>

      <!-- Tarjeta de actuadores -->
      <div class="card card-outline card-success shadow-sm">
        <div class="card-header bg-white">
          <h3 class="card-title font-weight-bold">Estado Actuadores</h3>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Caloventor
              <span class="badge" :class="datosInvernadero.caloventorActivo ? 'bg-success' : 'bg-danger'">
                {{ datosInvernadero.caloventorActivo ? 'ON' : 'OFF' }}
              </span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Ventanales
              <span class="badge" :class="datosInvernadero.ventanalesAbiertos ? 'bg-success' : 'bg-secondary'">
                {{ datosInvernadero.ventanalesAbiertos ? 'ABIERTOS' : 'CERRADOS' }}
              </span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Persianas
              <span class="badge" :class="datosInvernadero.persianasEnrolladas ? 'bg-success' : 'bg-secondary'">
                {{ datosInvernadero.persianasEnrolladas ? 'ENROLLADAS' : 'DESENROLLADAS' }}
              </span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Bomba de Agua
              <span class="badge" :class="datosInvernadero.bombaActiva ? 'bg-primary' : 'bg-secondary'">
                {{ datosInvernadero.bombaActiva ? 'Activo' : 'Inactivo' }}
              </span>
            </li>
          </ul>
        </div>
      </div>

    </div>

    <!-- Modelo 3D -->
    <div class="col-lg-9 col-md-8">
      <div class="card card-outline card-success shadow model-card h-100">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h3 class="card-title font-weight-bold m-0">
            <i class="fas fa-video mr-2 text-success"></i> 
            Renderizado 3D Interactivo
          </h3>
          <div class="card-tools">
            <button type="button" class="btn btn-tool" @click="toggleFullscreen">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        
        <div class="card-body p-0 canvas-container" ref="modeloContenedor">
           
           <div v-show="modeloCargado" ref="contenedor3D" style="width: 100%; height: 100%; border: 1px solid #ccc; overflow: hidden; cursor: grab;"></div>
           
           <div class="placeholder-3d" v-if="!modeloCargado">
             <i class="fas fa-cube fa-spin fa-3x text-success mb-3"></i>
             <h5 class="text-white">Cargando Gemelo Digital...</h5>
           </div>

        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.model-card {
  border-radius: 10px;
  overflow: hidden;
  min-height: 65vh; 
}

.canvas-container {
  height: 100%;
  min-height: 50vh;
  position: relative;
  background: radial-gradient(circle, #3a3a3a 0%, #1a1a1a 100%);
}

.placeholder-3d {
  width: 100%;
  /*height: 100%;*/
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.canvas-container:fullscreen {
  height: 100vh;
  width: 100vw;
}
</style>