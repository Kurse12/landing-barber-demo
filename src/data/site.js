import heroImg from '../assets/hero.jpg'
import heroImgWebp from '../assets/hero.jpg?format=webp'
import nosotrosImg from '../assets/nosotros.jpg'
import nosotrosImgWebp from '../assets/nosotros.jpg?format=webp'
import marcoImg from '../assets/equipo_marco.jpg'
import marcoImgWebp from '../assets/equipo_marco.jpg?format=webp'
import luciaImg from '../assets/equipo_lucia.jpg'
import luciaImgWebp from '../assets/equipo_lucia.jpg?format=webp'
import omarImg from '../assets/equipo_omar.jpg'
import omarImgWebp from '../assets/equipo_omar.jpg?format=webp'
import gal1 from '../assets/gal1.jpg'
import gal1Webp from '../assets/gal1.jpg?format=webp'
import gal2 from '../assets/gal2.jpg'
import gal2Webp from '../assets/gal2.jpg?format=webp'
import gal3 from '../assets/gal3.jpg'
import gal3Webp from '../assets/gal3.jpg?format=webp'
import gal4 from '../assets/gal4.jpg'
import gal4Webp from '../assets/gal4.jpg?format=webp'
import gal5 from '../assets/gal5.jpg'
import gal5Webp from '../assets/gal5.jpg?format=webp'

// Imágenes de las secciones que solo llevan una. `webp` es el formato
// preferido (30-40% más liviano a igual calidad); `src` queda como
// respaldo para navegadores que no lo decodifiquen.
export const images = {
  hero: {
    src: heroImg,
    webp: heroImgWebp,
    alt: 'Interior de la barbería: tres sillones frente a espejos redondos retroiluminados',
  },
  about: {
    src: nosotrosImg,
    webp: nosotrosImgWebp,
    alt: 'Barbero perfilando con peine y máquina el corte de un cliente',
  },
}

// Proyecto de demostración: el nombre, la dirección y las redes son genéricos
// a propósito. No representan un negocio real, así que no llevan una marca
// distintiva ni datos que puedan leerse como reales.
export const business = {
  name: 'Barbería Clásica',
  tagline: 'Barbería de barrio, corte de toda la vida',
  /*
    El titular va servido línea por línea, no como una frase que el navegador
    parte donde puede. En un cartel el corte de línea es una decisión de
    composición: cada línea lleva su propio cuerpo para terminar a ras del
    mismo margen, y eso solo se puede hacer si las líneas están declaradas.
  */
  claim: {
    poster: ['Cortes', 'de toda', 'la vida'],
    tail: 'con las manos de siempre',
  },
  // Dos formas del mismo número, porque cada destino la pide distinta:
  phone: '11 2222 3333', // como se muestra en pantalla
  phoneHref: '+541122223333', // para el enlace tel:
  email: 'hola@barberiaclasica.com.ar',
  address: 'Calle Principal 123, Buenos Aires',
  mapsUrl: 'https://maps.google.com/?q=Calle+Principal+123+Buenos+Aires',
  instagramHandle: '@barberiaclasica',
  social: {
    instagram: 'https://instagram.com/barberiaclasica',
    facebook: 'https://facebook.com/barberiaclasica',
    tiktok: 'https://tiktok.com/@barberiaclasica',
  },
}

// Precios en pesos: separador de miles con punto, como se escribe acá.
export const formatPrice = (value) => `$${value.toLocaleString('es-AR')}`

export const nav = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'equipo', label: 'Equipo' },
  { id: 'galeria', label: 'Galería' },
  { id: 'opiniones', label: 'Opiniones' },
  { id: 'reserva', label: 'Turnos' },
]

export const services = [
  {
    id: 'corte',
    preview: gal1,
    previewWebp: gal1Webp,
    name: 'Corte clásico',
    description: 'Tijera y máquina, lavado y peinado final.',
    price: 12000,
    duration: 30,
    featured: false,
  },
  {
    id: 'corte-barba',
    preview: gal3,
    previewWebp: gal3Webp,
    name: 'Corte + Barba',
    description: 'El completo: corte a medida y perfilado de barba con toalla caliente.',
    price: 18000,
    duration: 50,
    featured: true,
  },
  {
    id: 'barba',
    preview: gal2,
    previewWebp: gal2Webp,
    name: 'Afeitado a navaja',
    description: 'Afeitado tradicional, toalla caliente y bálsamo post-afeitado.',
    price: 10000,
    duration: 30,
    featured: false,
  },
  {
    id: 'nino',
    preview: nosotrosImg,
    previewWebp: nosotrosImgWebp,
    name: 'Corte para chicos',
    description: 'Para los más chicos (hasta 12 años). Sin apuro y con paciencia.',
    price: 9000,
    duration: 30,
    featured: false,
  },
  {
    id: 'tinte',
    preview: gal4,
    previewWebp: gal4Webp,
    name: 'Color y canas',
    description: 'Cobertura de canas o cambio de tono con productos sin amoníaco.',
    price: 15000,
    duration: 45,
    featured: false,
  },
  {
    id: 'ritual',
    preview: gal5,
    previewWebp: gal5Webp,
    name: 'Ritual de la casa',
    description: 'Corte, afeitado a navaja, máscara facial y masaje capilar.',
    price: 28000,
    duration: 80,
    featured: false,
  },
]

export const team = [
  {
    id: 'marco',
    name: 'Marco Ibáñez',
    role: 'Maestro barbero · Fundador',
    bio: '22 años atrás del sillón. Especialista en clásicos y afeitado a navaja.',
    photo: marcoImg,
    photoWebp: marcoImgWebp,
    instagram: 'https://instagram.com/marco.barber',
  },
  {
    id: 'lucia',
    name: 'Lucía Ferrer',
    role: 'Barbera · Color',
    bio: 'Degradados milimétricos y color. Se formó en Londres.',
    photo: luciaImg,
    photoWebp: luciaImgWebp,
    instagram: 'https://instagram.com/lucia.fades',
  },
  {
    id: 'omar',
    name: 'Omar Haddad',
    role: 'Barbero',
    bio: 'Diseño de barba y trabajos con navaja. Paciencia infinita con los chicos.',
    photo: omarImg,
    photoWebp: omarImgWebp,
    instagram: 'https://instagram.com/omar.blade',
  },
]

// Todas las fotos son verticales, así que la retícula usa celdas 3:4 iguales
// y el recorte es mínimo. El hueco que queda libre lo ocupa la tarjeta de
// Instagram que pinta Gallery.jsx: 5 fotos + 1 tarjeta = 6 celdas exactas.
export const gallery = [
  { id: 'g1', src: gal1, webp: gal1Webp, alt: 'Degradado bajo con textura despeinada arriba, visto de perfil' },
  { id: 'g2', src: gal2, webp: gal2Webp, alt: 'Perfilado de barba a navaja sobre espuma de afeitar' },
  { id: 'g3', src: gal3, webp: gal3Webp, alt: 'Corte con raya marcada a navaja y degradado alto' },
  { id: 'g4', src: gal4, webp: gal4Webp, alt: 'Perfilado de barba y cuello, visto de perfil' },
  { id: 'g5', src: gal5, webp: gal5Webp, alt: 'Las herramientas de la casa: tijeras, navaja y máquinas' },
]

// Banda de texto en bucle entre secciones.
export const marquee = [
  'Corte clásico',
  'Afeitado a navaja',
  'Diseño de barba',
  'Color y canas',
  'Desde 2003',
]

export const testimonials = [
  {
    id: 't1',
    name: 'Javier M.',
    since: 'Cliente desde 2019',
    rating: 5,
    text: 'Hace dos años que vengo y nunca salí con un corte que no me guste. Marco te escucha en serio.',
  },
  {
    id: 't2',
    name: 'Adrián P.',
    since: 'Cliente desde 2021',
    rating: 5,
    text: 'El afeitado a navaja es otro nivel. Salís de ahí como nuevo.',
  },
  {
    id: 't3',
    name: 'Sergio L.',
    since: 'Cliente desde 2016',
    rating: 4,
    text: 'Muy buen ambiente y precios justos. Sacá turno, que se llena.',
  },
]

export const schedule = [
  { day: 'Lunes', hours: 'Cerrado' },
  { day: 'Martes', hours: '10:00 - 20:00' },
  { day: 'Miércoles', hours: '10:00 - 20:00' },
  { day: 'Jueves', hours: '10:00 - 20:00' },
  { day: 'Viernes', hours: '10:00 - 21:00' },
  { day: 'Sábado', hours: '09:00 - 14:00' },
  { day: 'Domingo', hours: 'Cerrado' },
]

// Valores numéricos para poder animar el contador; el formato se aplica al pintar.
export const stats = [
  { id: 's1', to: 12000, prefix: '+', decimals: 0, label: 'cortes al año' },
  { id: 's2', to: 22, decimals: 0, label: 'años de oficio' },
  { id: 's3', to: 4.9, decimals: 1, label: 'estrellas en Google' },
]
