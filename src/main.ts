import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importa la configuración de rutas
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'admin-lte/dist/css/adminlte.min.css';

const app = createApp(App)

app.use(router)
app.mount('#app')