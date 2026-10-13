<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getJson, enviarJson } from '../services/api'

interface Cmd { nombreActuador: string; modoAutomatico: boolean; estadoManual: boolean }
const ACTUADORES = [
  { id: 'caloventor', nombre: 'Caloventor' }, { id: 'humidificador', nombre: 'Humidificador' },
  { id: 'ventanales', nombre: 'Ventanales' }, { id: 'persianas', nombre: 'Persianas' },
  { id: 'bomba', nombre: 'Bomba de agua' }
]
const estado = reactive<Record<string, Cmd>>({})
ACTUADORES.forEach(a => (estado[a.id] = { nombreActuador: a.id, modoAutomatico: true, estadoManual: false }))

onMounted(async () => {
  try { (await getJson<Cmd[]>('/api/actuadores/estado')).forEach(c => (estado[c.nombreActuador] = c)) }
  catch (e) { console.error(e) }
})
const enviar = (id: string) => enviarJson('POST', '/api/actuadores/control', estado[id]).catch(e => alert(e.message))
</script>

<template>
  <div class="card card-outline card-success shadow-sm">
    <div class="card-header bg-white"><h3 class="card-title font-weight-bold">Control de actuadores</h3></div>
    <ul class="list-group list-group-flush">
      <li v-for="a in ACTUADORES" :key="a.id" class="list-group-item d-flex justify-content-between align-items-center">
        <strong>{{ a.nombre }}</strong>
        <div class="d-flex align-items-center">
          <div class="custom-control custom-switch mr-4">
            <input type="checkbox" class="custom-control-input" :id="'auto-' + a.id"
                   v-model="estado[a.id].modoAutomatico" @change="enviar(a.id)">
            <label class="custom-control-label" :for="'auto-' + a.id">Automático</label>
          </div>
          <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" :id="'man-' + a.id"
                   v-model="estado[a.id].estadoManual" :disabled="estado[a.id].modoAutomatico" @change="enviar(a.id)">
            <label class="custom-control-label" :for="'man-' + a.id">Encendido</label>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>