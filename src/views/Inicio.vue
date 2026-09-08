<template>
  <div>
    <!-- Encabezado de la pagina -->
    <div class="content-header mb-3">
      <div class="container-fluid">
        <div class="row">
          <div class="col-sm-12">
            <h1 class="m-0 text-dark font-weight-bold">Presentación del Proyecto</h1>
          </div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="container-fluid">
        
        <!-- Tarjeta de presentacion-->
        <div class="row">
          <div class="col-lg-12">
            <div class="card card-success card-outline shadow-sm border-top-3">
              <div class="card-header bg-white">
                <h3 class="card-title font-weight-bold text-success" style="font-size: 1.25rem;">
                  <i class="fas fa-leaf mr-2"></i> Gemelo Digital de Invernadero
                </h3>
              </div>
              <div class="card-body">
                <h5 class="font-weight-bold mb-3 text-dark">Acerca de este desarrollo</h5>
                
                <p class="text-justify text-muted" style="font-size: 1.1rem; line-height: 1.6;">
                  Esta plataforma web ha sido diseñada y desarrollada con el propósito exclusivo de ser presentada como <strong>Trabajo Final de Carrera (Tesina)</strong>. 
                </p>
                <p class="text-justify text-muted" style="font-size: 1.1rem; line-height: 1.6;">
                  El objetivo central del proyecto es demostrar la viabilidad técnica y explorar las amplias posibilidades que ofrece la arquitectura de un <strong>Gemelo Digital (Digital Twin)</strong> aplicada a un entorno agrícola controlado. A través de una implementación a pequeña escala, este sistema expone cómo la integración de tecnologías en tiempo real puede transformar la gestión agronómica.
                </p>
                <p class="text-justify text-muted" style="font-size: 1.1rem; line-height: 1.6;">
                  La generación y el comportamiento del envío de datos de los sensores se simulan de manera continua mediante un robusto proyecto backend desarrollado en Java con el framework Spring Boot, el cual también orquesta la lógica reactiva de los actuadores y la persistencia de la información.
                </p>
                <p class="text-justify text-muted" style="font-size: 1.1rem; line-height: 1.6;">
                  Por su parte, la interfaz de usuario (frontend) ha sido construida utilizando Vue.js 3, integrando herramientas de vanguardia como TresJS para la renderización interactiva del modelo 3D, Chart.js para la visualización de métricas y tendencias, y el ecosistema de AdminLTE 3 junto a Bootstrap para lograr un diseño visual responsivo y profesional.
                </p>
                <p class="text-justify text-muted" style="font-size: 1.1rem; line-height: 1.6;">
                  Aquí podrá observar la sincronización inmediata entre las variables ambientales simuladas (temperatura, humedad, luminosidad), la reacción autónoma del equipamiento (ventilación, calefacción, humidificación) y su representación tanto espacial como estadística.
                </p>

                <div class="mt-4 pt-3 border-top">
                  <router-link to="/modelo-3d" class="btn btn-success btn-lg mr-3 shadow-sm">
                    <i class="fas fa-cube mr-2"></i> Ir al Modelo 3D y Monitoreo
                  </router-link>
                  <router-link to="/historial" class="btn btn-outline-secondary btn-lg shadow-sm">
                    <i class="fas fa-database mr-2"></i> Consultar Base de Datos
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjetas informativas -->
        <div class="row mt-3">
          <div class="col-12 col-sm-6 col-md-4">
            <div class="info-box shadow-sm">
              <span class="info-box-icon bg-info elevation-1"><i class="fas fa-microchip"></i></span>
              <div class="info-box-content">
                <span class="info-box-text text-uppercase font-weight-bold">Simulación IoT</span>
                <span class="info-box-number text-muted font-weight-normal">Broker RabbitMQ y Sensores</span>
              </div>
            </div>
          </div>
          
          <div class="col-12 col-sm-6 col-md-4">
            <div class="info-box shadow-sm">
              <span class="info-box-icon bg-warning elevation-1"><i class="fas fa-chart-pie text-white"></i></span>
              <div class="info-box-content">
                <span class="info-box-text text-uppercase font-weight-bold">Análisis de Datos</span>
                <span class="info-box-number text-muted font-weight-normal">Estadísticas y Tendencias</span>
              </div>
            </div>
          </div>

          <div class="col-12 col-sm-6 col-md-4">
            <div class="info-box shadow-sm">
              <span class="info-box-icon bg-primary elevation-1"><i class="fas fa-server"></i></span>
              <div class="info-box-content">
                <span class="info-box-text text-uppercase font-weight-bold">Persistencia</span>
                <span class="info-box-number text-muted font-weight-normal">Spring Boot y PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card-success.card-outline {
  border-top-width: 4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-success.card-outline:hover {
  transform: translateY(-2px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
.info-box {
  transition: transform 0.2s ease;
}
.info-box:hover {
  transform: translateY(-2px);
}
</style>