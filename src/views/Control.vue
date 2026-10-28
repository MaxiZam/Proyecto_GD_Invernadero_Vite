<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { getJson, enviarJson } from '../services/api'
import { useInvernadero } from '../composables/useInvernadero'

interface Cmd { nombreActuador: string; modoAutomatico: boolean; estadoManual: boolean }
type CampoReal = 'caloventorActivo' | 'humidificadorActivo' | 'ventanalesAbiertos' | 'persianasEnrolladas' | 'bombaActiva'
interface Actuador { id: string; nombre: string; real: CampoReal; on: string; off: string; etiquetaManual: string }
interface Fila extends Actuador { cmd: Cmd; enviando: boolean }

// estadoManual=true => encendido / abierto / enrolladas (igual que en el simulador)
const ACTUADORES: Actuador[] = [
  { id: 'caloventor', nombre: 'Caloventor', real: 'caloventorActivo', on: 'ON', off: 'OFF', etiquetaManual: 'Encendido' },
  { id: 'humidificador', nombre: 'Humidificador', real: 'humidificadorActivo', on: 'ON', off: 'OFF', etiquetaManual: 'Encendido' },
  { id: 'ventanales', nombre: 'Ventanales', real: 'ventanalesAbiertos', on: 'ABIERTOS', off: 'CERRADOS', etiquetaManual: 'Abiertos' },
  { id: 'persianas', nombre: 'Persianas', real: 'persianasEnrolladas', on: 'ENROLLADAS', off: 'DESENROLLADAS', etiquetaManual: 'Enrolladas' },
  { id: 'bomba', nombre: 'Bomba de agua', real: 'bombaActiva', on: 'ACTIVA', off: 'INACTIVA', etiquetaManual: 'Encendida' }
]

const { telemetria, sinDatos } = useInvernadero()

const filas = reactive<Fila[]>(
  ACTUADORES.map(a => ({
    ...a,
    cmd: { nombreActuador: a.id, modoAutomatico: true, estadoManual: false },
    enviando: false
  }))
)
const error = ref('')

const recargar = async () => {
  try {
    const lista = (await getJson<Cmd[]>('/api/actuadores/estado')) ?? []
    lista.forEach(c => {
      const fila = filas.find(f => f.id === c.nombreActuador)
      if (fila) fila.cmd = c
    })
  } catch (e) {
    console.error(e)
  }
}

const enviar = async (fila: Fila) => {
  fila.enviando = true
  try {
    await enviarJson('POST', '/api/actuadores/control', fila.cmd)
    error.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    await recargar()   // vuelve al último estado conocido por el backend
  } finally {
    fila.enviando = false
  }
}

const cambiarModo = (fila: Fila, automatico: boolean) => {
  fila.cmd.modoAutomatico = automatico
  return enviar(fila)
}
const cambiarManual = (fila: Fila, encendido: boolean) => {
  fila.cmd.estadoManual = encendido
  return enviar(fila)
}

onMounted(recargar)
</script>

<template>
  <div class="card card-outline card-success shadow-sm">
    <div class="card-header bg-white">
      <h3 class="card-title font-weight-bold">
        <i class="fas fa-toggle-on mr-2 text-success"></i> Control de actuadores
      </h3>
    </div>

    <div v-if="error" class="alert alert-danger m-3 mb-0">{{ error }}</div>
    <div v-if="sinDatos" class="alert alert-warning m-3 mb-0">
      Sin telemetría: el estado real mostrado puede no estar actualizado.
    </div>

    <ul class="list-group list-group-flush">
      <li v-for="f in filas" :key="f.id" class="list-group-item">
        <div class="d-flex justify-content-between align-items-center flex-wrap">

          <div>
            <strong>{{ f.nombre }}</strong>
            <span class="badge ml-2" :class="telemetria[f.real] ? 'bg-success' : 'bg-secondary'">
              {{ sinDatos ? '--' : (telemetria[f.real] ? f.on : f.off) }}
            </span>
            <span class="badge ml-1 badge-light border">
              {{ f.cmd.modoAutomatico ? 'AUTO' : 'MANUAL' }}
            </span>
          </div>

          <div class="d-flex align-items-center">
            <div class="custom-control custom-switch mr-4">
              <input type="checkbox" class="custom-control-input" :id="'auto-' + f.id"
                     :checked="f.cmd.modoAutomatico" :disabled="f.enviando"
                     @change="cambiarModo(f, ($event.target as HTMLInputElement).checked)">
              <label class="custom-control-label" :for="'auto-' + f.id">Automático</label>
            </div>
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" :id="'man-' + f.id"
                     :checked="f.cmd.estadoManual"
                     :disabled="f.cmd.modoAutomatico || f.enviando"
                     @change="cambiarManual(f, ($event.target as HTMLInputElement).checked)">
              <label class="custom-control-label" :for="'man-' + f.id">{{ f.etiquetaManual }}</label>
            </div>
          </div>

        </div>
      </li>
    </ul>
  </div>
</template>