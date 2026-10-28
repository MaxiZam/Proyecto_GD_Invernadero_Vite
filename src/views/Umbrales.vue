<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { getJson, enviarJson } from '../services/api'

interface Umbrales {
  tempMin: number; tempMax: number
  humSueloMin: number; humSueloMax: number
  humAireMin: number; humAireMax: number
  luzMin: number; luzMax: number
}

const GRUPOS = [
  { titulo: 'Temperatura (°C)', icono: 'fa-thermometer-half', min: 'tempMin', max: 'tempMax', step: 0.5 },
  { titulo: 'Humedad del suelo (%)', icono: 'fa-seedling', min: 'humSueloMin', max: 'humSueloMax', step: 1 },
  { titulo: 'Humedad del aire (%)', icono: 'fa-tint', min: 'humAireMin', max: 'humAireMax', step: 1 },
  { titulo: 'Luminosidad (lux)', icono: 'fa-sun', min: 'luzMin', max: 'luzMax', step: 10 }
] as const

const u = reactive<Umbrales>({
  tempMin: 18, tempMax: 28, humSueloMin: 50, humSueloMax: 80, humAireMin: 50, humAireMax: 75, luzMin: 400, luzMax: 900
})

const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const exito = ref('')

const cargar = async () => {
  cargando.value = true
  error.value = ''
  try {
    Object.assign(u, await getJson<Umbrales>('/api/umbrales'))
  } catch (e) {
    error.value = 'No se pudieron cargar los umbrales: ' + (e instanceof Error ? e.message : String(e))
  } finally {
    cargando.value = false
  }
}

const validar = (): string => {
  const claves = Object.keys(u) as (keyof Umbrales)[]
  if (claves.some(k => typeof u[k] !== 'number' || !Number.isFinite(u[k]))) {
    return 'Completa todos los campos con valores numéricos.'
  }
  if (GRUPOS.some(g => u[g.min] >= u[g.max])) return 'Cada mínimo debe ser menor que su máximo.'
  const porcentajes = [u.humSueloMin, u.humSueloMax, u.humAireMin, u.humAireMax]
  if (porcentajes.some(v => v < 0 || v > 100)) return 'Las humedades deben estar entre 0 y 100 %.'
  if (u.luzMin < 0) return 'La luminosidad no puede ser negativa.'
  return ''
}

const guardar = async () => {
  exito.value = ''
  error.value = validar()
  if (error.value) return
  guardando.value = true
  try {
    await enviarJson('PUT', '/api/umbrales', { ...u })
    exito.value = 'Umbrales guardados y enviados al simulador.'
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="content-header mb-3">
      <h1 class="m-0 text-dark font-weight-bold">Umbrales de operación</h1>
      <p class="text-muted mb-0">Definen cuándo se generan alertas y cuándo actúa el control automático.</p>
    </div>

    <div v-if="cargando" class="text-center text-muted py-4">Cargando umbrales...</div>

    <form v-else @submit.prevent="guardar">
      <div class="row">
        <div v-for="g in GRUPOS" :key="g.min" class="col-md-6 mb-3">
          <div class="card card-outline card-success shadow-sm h-100">
            <div class="card-header bg-white">
              <h3 class="card-title font-weight-bold">
                <i :class="['fas', g.icono, 'mr-2', 'text-success']"></i>{{ g.titulo }}
              </h3>
            </div>
            <div class="card-body">
              <div class="form-row">
                <div class="form-group col-6">
                  <label :for="g.min">Mínimo</label>
                  <input :id="g.min" type="number" class="form-control" :step="g.step" v-model.number="u[g.min]">
                </div>
                <div class="form-group col-6">
                  <label :for="g.max">Máximo</label>
                  <input :id="g.max" type="number" class="form-control" :step="g.step" v-model.number="u[g.max]">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="exito" class="alert alert-success">{{ exito }}</div>

      <button type="submit" class="btn btn-success mr-2" :disabled="guardando">
        <i class="fas fa-save mr-1"></i> {{ guardando ? 'Guardando...' : 'Guardar umbrales' }}
      </button>
      <button type="button" class="btn btn-outline-secondary" :disabled="guardando" @click="cargar">
        Descartar cambios
      </button>
    </form>
  </div>
</template>