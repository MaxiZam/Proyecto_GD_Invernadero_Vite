import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa la configuración de rutas

const app = createApp(App)

app.use(router) // Le dice a Vue que use el enrutador
app.mount('#app') // Monta la aplicación en el div con id "app" del index.html