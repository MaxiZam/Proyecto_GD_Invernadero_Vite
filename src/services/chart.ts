import {
  Chart as ChartJS, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

export const COLOR = {
  temperatura: 'rgb(231, 76, 60)',
  humedadSuelo: 'rgb(52, 152, 219)',
  humedadAire: 'rgb(26, 188, 156)',
  luminosidad: 'rgb(241, 196, 15)',
  ok: '#2ecc71',
  alerta: '#e67e22',
  gris: '#ecf0f1'
}

/** 'rgb(r, g, b)' -> 'rgba(r, g, b, a)' */
export const alfa = (rgb: string, a: number) => rgb.replace('rgb(', 'rgba(').replace(')', `, ${a})`)