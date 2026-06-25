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
let controls: OrbitControls
let animationFrameId: number

// Variables para almacenar las partes específicas del modelo de Blender
let materialCaloventor: THREE.MeshStandardMaterial | undefined
const ventanasMeshes: THREE.Object3D[] = [] // Arreglo para guardar los 8 ventanales

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
            
            // Forzamos la transparencia en Three.js si el material viene con opacidad < 1 
            // o si el nombre del material incluye "vidrio" o "plastico"
            if (mat.opacity < 1 || mat.name.toLowerCase().includes('vidrio') || mat.name.toLowerCase().includes('plastico')) {
              mat.transparent = true
              mat.opacity = 0.4 // Puedes ajustar este valor (0.0 a 1.0)
              mat.depthWrite = false // Fundamental para que los vidrios no tengan errores visuales
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
        
        // Buscar todas las ventanas (Usamos toLowerCase() e includes() para evitar problemas de mayúsculas/minúsculas)
        if (mesh.name.toLowerCase().includes('ventanal')) {
          ventanasMeshes.push(mesh)
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

      // Aplicamos la rotación con transición suave
      // Cambia 'rotation.x' por 'rotation.z' o 'rotation.y' si giran hacia un eje incorrecto
      ventana.rotation.x = THREE.MathUtils.lerp(ventana.rotation.x, rotacionObjetivo, 0.05);
    })

    controls.update() // Necesario para el Damping (inercia)
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
    </div>

    <!-- Contenedor estricto para Three.js -->
    <div ref="contenedor3D" style="width: 100%; border: 1px solid #ccc; overflow: hidden; cursor: grab;"></div>
  </section>
</template>