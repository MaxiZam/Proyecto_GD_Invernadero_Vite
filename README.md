# 🪴 Gemelo Digital - Invernadero Automatizado

Este proyecto es una simulación integral de un Gemelo Digital para un invernadero automatizado. Está compuesto por un motor de simulación de variables agronómicas, un sistema de mensajería asíncrona IoT, alertas en tiempo real y una interfaz gráfica interactiva en 3D.

## 🛠️ Tecnologías Utilizadas
* **Backend:** Java Spring Boot, Hibernate/JPA.
* **Mensajería:** RabbitMQ (Emulando telemetría IoT).
* **Base de Datos:** PostgreSQL.
* **Frontend:** Vue.js 3, TresJS (Three.js), Bootstrap, AdminLTE 3, Chart.js.
* **Infraestructura:** Docker.

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado en tu sistema:
- [Docker](https://www.docker.com/products/docker-desktop) instalado y ejecutándose.
- [Java JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) o superior.
- [Node.js](https://nodejs.org/) (versión 18 o superior) y NPM.
- Maven (Opcional, el proyecto incluye el wrapper `mvnw`).

---

## 🚀 Guía de Instalación y Ejecución

El proyecto debe levantarse en el siguiente orden para asegurar que las conexiones se establezcan correctamente:

### Paso 1: Levantar la Infraestructura (Base de Datos y RabbitMQ)

Abre una terminal y ejecuta los siguiente comandos de Docker para descargar las imágenes y crear los contenedores necesarios en segundo plano (`-d`):

**1. Contenedor de PostgreSQL (Base de Datos):**
```bash
docker run -d --name invernadero-postgres -p 5432:5432 -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=adminpassword -e POSTGRES_DB=invernadero_db postgres:15-alpine
```
**2. Contenedor de RabbitMQ (Mensajería):**
```bash
docker run -d --name invernadero-rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=guest -e RABBITMQ_DEFAULT_PASS=guest rabbitmq:3-management
```