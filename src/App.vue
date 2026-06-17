<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <div>
        <h1>Gemelo Digital Invernadero</h1>
      </div>
      
      <ul>
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><RouterLink to="/modelo-3d">Modelo 3D y Monitoreo</RouterLink></li>
        <li><RouterLink to="/estadisticas">Estadísticas</RouterLink></li>
        <li><RouterLink to="/camara">Cámara en Vivo</RouterLink></li>
      </ul>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>