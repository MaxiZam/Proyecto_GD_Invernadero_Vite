export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function getJson<T>(ruta: string): Promise<T> {
  const r = await fetch(`${API_URL}${ruta}`)
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${ruta}`)
  return (r.status === 204 ? null : await r.json()) as T
}

export async function enviarJson(metodo: 'POST' | 'PUT', ruta: string, cuerpo: unknown) {
  const r = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  })
  if (!r.ok) throw new Error(await r.text())
}