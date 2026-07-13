<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Referencia al contenedor HTML donde se inyectará el canvas 3D
const contenedor3D = ref<HTMLElement | null>(null)

// 1. ESTADO REACTIVO (Simulando los datos del Backend Spring / MQTT)
const datosSensores = ref({
  temperatura: 24.5,
  caloventorActivo: false,
  ventanalesAbiertos: false,
  persianasEnrolladas: false
})

// Variables globales de Three.js
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId: number

// Variables para almacenar las partes específicas del modelo de Blender
let materialCaloventor: THREE.MeshStandardMaterial | undefined
const ventanasMeshes: THREE.Object3D[] = []
const persianasMeshes: THREE.Object3D[] = []

const escalasInicialesPersianas = new Map<string, number>()

const initThreeJS = () => {
  if (!contenedor3D.value) return

  // -- A. Configuración Básica (Escena, Cámara y Renderizador) --
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf4f4f5) // Color de fondo neutro

  camera = new THREE.PerspectiveCamera(75, contenedor3D.value.clientWidth / 500, 0.1, 1000)
  camera.position.set(0, 2, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(contenedor3D.value.clientWidth, 500)
  contenedor3D.value.appendChild(renderer.domElement)

  // Configuración de Controles Orbitales (Zoom y Rotación)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true 
  controls.dampingFactor = 0.05

  // -- B. Iluminación --
  const luzDireccional = new THREE.DirectionalLight(0xffffff, 1)
  luzDireccional.position.set(5, 10, 5)
  scene.add(luzDireccional)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))

  // -- C. Carga del Modelo GLB --
  const loader = new GLTFLoader()
  loader.load('/invernadero.glb', (gltf) => {
    const modelo = gltf.scene

    modelo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        
        // Corrección de Backface Culling y TRANSPARENCIA
        if (mesh.material) {
          const materiales = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          materiales.forEach(mat => {
            mat.side = THREE.DoubleSide
            
            // Respetar Alpha original de Blender y activar transparencia
            const nombreMat = mat.name.toLowerCase()
            if (mat.opacity < 1 || nombreMat.includes('vidrio') || nombreMat.includes('plastico')) {
              mat.transparent = true
              mat.depthWrite = false 
              mat.needsUpdate = true
            }
          })
        }

        // Buscar el Material del Caloventor
        if (mesh.material && !Array.isArray(mesh.material)) {
          if (mesh.material.name === 'Material_Caloventor') {
            materialCaloventor = mesh.material as THREE.MeshStandardMaterial
            actualizarColorCaloventor()
          }
        }
        
        if (mesh.name.toLowerCase().includes('ventanal')) {
          ventanasMeshes.push(mesh)
        }

        if (mesh.name.toLowerCase().includes('persiana')) {
          persianasMeshes.push(mesh)
          escalasInicialesPersianas.set(mesh.uuid, mesh.scale.y)
        }
      }
    })

    modelo.position.set(0, -1, 0) // Centrar modelo
    scene.add(modelo)
  }, undefined, (error) => {
    console.error('Error al cargar el modelo GLB:', error)
  })

  // -- D. Bucle de Animación (Render Loop) --
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    
    ventanasMeshes.forEach(ventana => {
      const nombreVentana = ventana.name.toLowerCase();
      
      const esLadoDerecho = nombreVentana.includes('derecho');
      const esLadoIzquierdo = nombreVentana.includes('izquierdo');

      let rotacionObjetivo = 0;
      if (esLadoIzquierdo) {
        if (!datosSensores.value.ventanalesAbiertos) {
          rotacionObjetivo = Math.PI*(-0.25);
        } else {
          rotacionObjetivo = 0; 
        }
      } else if (esLadoDerecho) {
        if (!datosSensores.value.ventanalesAbiertos) {
          rotacionObjetivo = Math.PI + Math.PI / 4; 
        } else {
          rotacionObjetivo = Math.PI; 
        }
      }

      ventana.rotation.x = THREE.MathUtils.lerp(ventana.rotation.x, rotacionObjetivo, 0.05);

      // --- ANIMACIÓN DE LAS PERSIANAS (Enrollado sin deformar) ---
      persianasMeshes.forEach(persiana => {
        // 1. Recuperamos el tamaño original desde la memoria
        const escalaOriginal = escalasInicialesPersianas.get(persiana.uuid) || 1;
        
        // 2. Si está enrollada (arriba) = 0.05, Si está desenrollada (abajo) = escala original
        const escalaObjetivo = datosSensores.value.persianasEnrolladas ? 0.05 : escalaOriginal;

        // 3. Aplicamos la escala suavemente
        persiana.scale.y = THREE.MathUtils.lerp(persiana.scale.y, escalaObjetivo, 0.05);
      });
    })

    controls.update()
    renderer.render(scene, camera)
  }
  
  animate()
}

// 2. LÓGICA DE CAMBIO DE COLOR (Caloventor)
const actualizarColorCaloventor = () => {
  if (materialCaloventor) {
    if (datosSensores.value.caloventorActivo) {
      materialCaloventor.color.setHex(0xff0000) // Rojo: Activo
    } else {
      materialCaloventor.color.setHex(0x0000ff) // Azul: Inactivo
    }
  }
}

// 3. REACTIVIDAD: Vigilar los datos
watch(() => datosSensores.value.caloventorActivo, actualizarColorCaloventor)

let intervaloFetch: ReturnType<typeof setInterval>

onMounted(() => {
  initThreeJS()

  // Simulación: Cambiar estados cada 4 segundos
  intervaloFetch = setInterval(() => {
    datosSensores.value.caloventorActivo = !datosSensores.value.caloventorActivo
    datosSensores.value.ventanalesAbiertos = !datosSensores.value.ventanalesAbiertos
    datosSensores.value.persianasEnrolladas = !datosSensores.value.persianasEnrolladas
  }, 4000)
})

onUnmounted(() => {
  clearInterval(intervaloFetch)
  cancelAnimationFrame(animationFrameId)
  if (renderer) renderer.dispose()
})
</script>

<template>
  <section>
    <h2>Modelo 3D y Datos en Tiempo Real</h2>
    
    <div style="margin-bottom: 20px;">
      <p>Temperatura Actual: {{ datosSensores.temperatura }} °C</p>
      <p>Estado Caloventor: {{ datosSensores.caloventorActivo ? 'ON' : 'OFF' }}</p>
      <p>Ventanales Superiores: {{ datosSensores.ventanalesAbiertos ? 'ABIERTOS' : 'CERRADOS' }}</p>
      <p>Persianas de Sombreado: {{ datosSensores.persianasEnrolladas ? 'ENROLLADAS (ARRIBA)' : 'DESENROLLADAS (ABAJO)' }}</p>
    </div>

    <!-- Contenedor estricto para Three.js -->
    <div ref="contenedor3D" style="width: 100%; border: 1px solid #ccc; overflow: hidden; cursor: grab;"></div>
  </section>
</template>