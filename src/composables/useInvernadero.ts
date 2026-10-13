import { reactive, ref } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface Telemetria {
  temperatura: number; humedadSuelo: number; humedadAire: number; luminosidad: number
  caloventorActivo: boolean; humidificadorActivo: boolean
  ventanalesAbiertos: boolean; persianasEnrolladas: boolean; bombaActiva: boolean
}
export interface Alerta {
  id: number; tipo: string; componente: string; mensaje: string; severidad: string; timestamp: string
}

const INICIAL: Telemetria = {
  temperatura: 0, humedadSuelo: 0, humedadAire: 0, luminosidad: 0,
  caloventorActivo: false, humidificadorActivo: false,
  ventanalesAbiertos: false, persianasEnrolladas: false, bombaActiva: false
}
const MAX_ALERTAS = 100
const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080/ws-invernadero'

const telemetria = reactive<Telemetria>({ ...INICIAL })
const alertas = ref<Alerta[]>([])
const conectado = ref(false)
let client: Client | null = null
let contador = 0

export function conectar() {
  if (client) return
  client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    onConnect: () => {
      conectado.value = true
      client!.subscribe('/topic/sensores', m => Object.assign(telemetria, JSON.parse(m.body)))
      client!.subscribe('/topic/alertas', m => {
        alertas.value.unshift({ ...JSON.parse(m.body), id: ++contador })
        if (alertas.value.length > MAX_ALERTAS) alertas.value.pop()
      })
    },
    onWebSocketClose: () => { conectado.value = false; Object.assign(telemetria, INICIAL) },
    onStompError: f => console.error('STOMP:', f.headers['message'])
  })
  client.activate()
}

export const useInvernadero = () => ({
  telemetria, alertas, conectado,
  descartarAlerta: (id: number) => { alertas.value = alertas.value.filter(a => a.id !== id) },
  limpiarAlertas: () => { alertas.value = [] }
})