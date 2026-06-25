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
  ventanalesAbiertos: false
})

// Variables globales de Three.js
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer
let animationFrameId: number

// Variables para almacenar las partes específicas del modelo de Blender //
let materialCaloventor: THREE.MeshStandardMaterial | undefined
const ventanasMeshes: THREE.Object3D[] = []

const initThreeJS = () => {
  if (!contenedor3D.value) return

  // -- A. Configuración Básica (Escena, Cámara y Renderizador) --
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf4f4f5) // Color de fondo neutro

  // Ajustar cámara a las proporciones del contenedor
  camera = new THREE.PerspectiveCamera(75, contenedor3D.value.clientWidth / 500, 0.1, 1000)
  camera.position.set(0, 2, 5) // Posición de la cámara frente al invernadero

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(contenedor3D.value.clientWidth, 500)
  contenedor3D.value.appendChild(renderer.domElement)

  // --- Configuración de Controles Orbitales ---
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true // inercia
  controls.dampingFactor = 0.05
  // Limita zoom y rotación
  controls.maxPolarAngle = Math.PI / 2

  // -- B. Iluminación --
  const luzDireccional = new THREE.DirectionalLight(0xffffff, 1)
  luzDireccional.position.set(5, 10, 5)
  scene.add(luzDireccional)
  scene.add(new THREE.AmbientLight(0xffffff, 0.6))

  // -- C. Carga del Modelo GLB --
  const loader = new GLTFLoader()
  loader.load('/invernadero.glb', (gltf) => {
    const modelo = gltf.scene

   // Recorrer el modelo buscando los nombres exactos que pusiste en Blender
    modelo.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        
        // Verifica que el material exista y NO sea un arreglo
        if (mesh.material && !Array.isArray(mesh.material)) {
          
          if (mesh.material.name === 'Material_Caloventor') {
            materialCaloventor = mesh.material as THREE.MeshStandardMaterial
            actualizarColorCaloventor()
          }
        }
        
        // Buscar todas las ventanas y agregarlas a la lista
        if (mesh.name.startsWith('ventanal.')) {
          ventanasMeshes.push(mesh)
        }
      }
    })

    // Centrar modelo (opcional)
    modelo.position.set(0, -1, 0)
    scene.add(modelo)
  }, undefined, (error) => {
    console.error('Error al cargar el modelo GLB:', error)
  })

  // -- D. Bucle de Animación (Render Loop) --
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    // Animación de los Ventanales (Apertura a 45° simultánea)
    // Si están abiertos, el objetivo es 45° (Math.PI / 4). Si están cerrados, es 0.
    const rotacionObjetivo = datosSensores.value.ventanalesAbiertos ? (Math.PI / 4) : 0
    
    ventanasMeshes.forEach(ventana => {
      // THREE.MathUtils.lerp(valor_actual, valor_objetivo, velocidad)
      ventana.rotation.x = THREE.MathUtils.lerp(ventana.rotation.x, rotacionObjetivo, 0.05)
    })

    // Actualizar controles en cada frame
    controls.update() 
    renderer.render(scene, camera)
  }
  
  animate()
}

// 2. LÓGICA DE CAMBIO DE COLOR (Acción a un material)
const actualizarColorCaloventor = () => {
  if (materialCaloventor) {
    if (datosSensores.value.caloventorActivo) {
      materialCaloventor.color.setHex(0xff0000) // Rojo: Activo
    } else {
      materialCaloventor.color.setHex(0x0000ff) // Azul: Inactivo
    }
  }
}

// 3. REACTIVIDAD: Vigilar los datos de Vue para modificar Three.js
watch(() => datosSensores.value.caloventorActivo, actualizarColorCaloventor)

// Simulación del backend en Spring (Polling)
let intervaloFetch: ReturnType<typeof setInterval>

onMounted(() => {
  initThreeJS()

  // Simulación: Cambiar el estado cada 4 segundos para probar animaciones y colores
  intervaloFetch = setInterval(() => {
    datosSensores.value.caloventorActivo = !datosSensores.value.caloventorActivo
    datosSensores.value.ventanalesAbiertos = !datosSensores.value.ventanalesAbiertos
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
    </div>

    <div ref="contenedor3D" style="width: 100%; border: 1px solid #ccc; overflow: hidden;"></div>
  </section>
</template>