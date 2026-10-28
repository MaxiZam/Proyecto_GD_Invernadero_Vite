# 🪴 Gemelo Digital - Invernadero Automatizado

Simulación integral de un Gemelo Digital para un invernadero automatizado: simulador de variables
agronómicas, mensajería asíncrona (RabbitMQ), backend con alertas y estadísticas, y una interfaz web
con modelo 3D interactivo.

## Arquitectura

```
Simulador ──telemetría──▶ RabbitMQ ──▶ Backend ──WebSocket (/topic/sensores, /topic/alertas)──▶ Frontend
Simulador ◀──comandos / umbrales── RabbitMQ ◀── Backend ◀──REST (/api/actuadores, /api/umbrales)── Frontend
                                                  └──▶ PostgreSQL (histórico consolidado cada minuto)
```

## Tecnologías
* **Simulador y backend:** Java 21, Spring Boot 4, Spring AMQP, Spring Data JPA, WebSocket (STOMP/SockJS).
* **Mensajería:** RabbitMQ. **Base de datos:** PostgreSQL. **Infraestructura:** Docker.
* **Frontend:** Vue 3 + Vite + TypeScript, Three.js, Chart.js, Bootstrap 4 y AdminLTE 3.

## Requisitos
Docker, JDK 21+, Node.js 20.19+ (o 22.12+) y NPM. Maven es opcional (se usa `mvnw`).

## Puesta en marcha (en este orden)

### 1. Infraestructura
Desde la carpeta que contiene `docker-compose.yml`:
```bash
docker compose up -d
```
Panel de RabbitMQ: http://localhost:15672 (usuario `guest`, contraseña `guest`).

### 2. Backend (puerto 8080)
```bash
./mvnw spring-boot:run
```

### 3. Simulador
```bash
./mvnw spring-boot:run
```
Un día simulado dura 24 minutos (`simulador.aceleracion=60`). Para tiempo real, usa `simulador.aceleracion=1`.

### 4. Frontend (puerto 5173)
```bash
npm install
npm run dev
```
En Windows, si falla con `husky`, usa `npm install --ignore-scripts` (el proyecto incluye un `.npmrc` que ya lo configura).
Las URLs del backend se definen en `.env` (`VITE_API_URL`, `VITE_WS_URL`).

## Pantallas
| Ruta | Función |
|---|---|
| `/modelo-3d` | Monitoreo en tiempo real y gemelo 3D |
| `/estadisticas` | Análisis de los últimos 30 días |
| `/historial` | Registros consolidados, filtro por fechas y exportación a CSV |
| `/control` | Modo automático/manual de cada actuador |
| `/umbrales` | Umbrales que gobiernan alertas y control automático |
| `/notificaciones` | Alertas en tiempo real |

## Si cambias la declaración de una cola
RabbitMQ responde `PRECONDITION_FAILED` si la cola ya existe con otros argumentos. Bórrala desde el panel
(Queues → Delete) y reinicia backend y simulador.