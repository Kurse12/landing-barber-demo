import heroImg from '../assets/hero.jpg'
import nosotrosImg from '../assets/nosotros.jpg'
import marcoImg from '../assets/equipo_marco.jpg'
import luciaImg from '../assets/equipo_lucia.jpg'
import omarImg from '../assets/equipo_omar.jpg'
import gal1 from '../assets/gal1.jpg'
import gal2 from '../assets/gal2.jpg'
import gal3 from '../assets/gal3.jpg'
import gal4 from '../assets/gal4.jpg'
import gal5 from '../assets/gal5.jpg'

// Imágenes de las secciones que solo llevan una.
export const images = {
  hero: {
    src: heroImg,
    alt: 'Interior de la barbería: tres sillones frente a espejos redondos retroiluminados',
  },
  about: {
    src: nosotrosImg,
    alt: 'Barbero perfilando con peine y máquina el corte de un cliente',
  },
}

export const business = {
  name: 'Navaja & Roble',
  tagline: 'Barbería clásica en San Telmo, Buenos Aires',
  // El titular va partido para poder darle otro tono a la segunda mitad.
  claim: { lead: 'Cortes de toda la vida,', tail: 'con las manos de siempre.' },
  // Tres formas del mismo número, porque cada destino la pide distinta:
  phone: '11 2222 3333', // como se muestra en pantalla
  phoneHref: '+541122223333', // para el enlace tel:
  whatsapp: '5491122223333', // wa.me exige el 9 de celular después del 54
  email: 'hola@navajayroble.com.ar',
  address: 'Defensa 1024, San Telmo, CABA',
  mapsUrl: 'https://maps.google.com/?q=Defensa+1024+San+Telmo+Buenos+Aires',
  social: {
    instagram: 'https://instagram.com/navajayroble',
    facebook: 'https://facebook.com/navajayroble',
    tiktok: 'https://tiktok.com/@navajayroble',
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
    name: 'Corte clásico',
    description: 'Tijera y máquina, lavado y peinado final.',
    price: 12000,
    duration: 30,
    featured: false,
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    description: 'El completo: corte a medida y perfilado de barba con toalla caliente.',
    price: 18000,
    duration: 50,
    featured: true,
  },
  {
    id: 'barba',
    name: 'Afeitado a navaja',
    description: 'Afeitado tradicional, toalla caliente y bálsamo post-afeitado.',
    price: 10000,
    duration: 30,
    featured: false,
  },
  {
    id: 'nino',
    name: 'Corte para chicos',
    description: 'Para los más chicos (hasta 12 años). Sin apuro y con paciencia.',
    price: 9000,
    duration: 30,
    featured: false,
  },
  {
    id: 'tinte',
    name: 'Color y canas',
    description: 'Cobertura de canas o cambio de tono con productos sin amoníaco.',
    price: 15000,
    duration: 45,
    featured: false,
  },
  {
    id: 'ritual',
    name: 'Ritual Navaja & Roble',
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
    instagram: 'https://instagram.com/marco.barber',
  },
  {
    id: 'lucia',
    name: 'Lucía Ferrer',
    role: 'Barbera · Color',
    bio: 'Degradados milimétricos y color. Se formó en Londres.',
    photo: luciaImg,
    instagram: 'https://instagram.com/lucia.fades',
  },
  {
    id: 'omar',
    name: 'Omar Haddad',
    role: 'Barbero',
    bio: 'Diseño de barba y trabajos con navaja. Paciencia infinita con los chicos.',
    photo: omarImg,
    instagram: 'https://instagram.com/omar.blade',
  },
]

// Todas las fotos son verticales, así que la retícula usa celdas 3:4 iguales
// y el recorte es mínimo. El hueco que queda libre lo ocupa la tarjeta de
// Instagram que pinta Gallery.jsx: 5 fotos + 1 tarjeta = 6 celdas exactas.
export const gallery = [
  { id: 'g1', src: gal1, alt: 'Degradado bajo con textura despeinada arriba, visto de perfil' },
  { id: 'g2', src: gal2, alt: 'Perfilado de barba a navaja sobre espuma de afeitar' },
  { id: 'g3', src: gal3, alt: 'Corte con raya marcada a navaja y degradado alto' },
  { id: 'g4', src: gal4, alt: 'Perfilado de barba y cuello, visto de perfil' },
  { id: 'g5', src: gal5, alt: 'Las herramientas de la casa: tijeras, navaja y máquinas' },
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
    rating: 5,
    text: 'Hace dos años que vengo y nunca salí con un corte que no me guste. Marco te escucha en serio.',
  },
  {
    id: 't2',
    name: 'Adrián P.',
    rating: 5,
    text: 'El afeitado a navaja es otro nivel. Salís de ahí como nuevo.',
  },
  {
    id: 't3',
    name: 'Sergio L.',
    rating: 4,
    text: 'Muy buen ambiente y precios justos. Sacá turno, que se llena.',
  },
]

export const schedule = [
  { day: 'Lunes', hours: 'Cerrado' },
  { day: 'Martes', hours: '10:00 – 20:00' },
  { day: 'Miércoles', hours: '10:00 – 20:00' },
  { day: 'Jueves', hours: '10:00 – 20:00' },
  { day: 'Viernes', hours: '10:00 – 21:00' },
  { day: 'Sábado', hours: '09:00 – 14:00' },
  { day: 'Domingo', hours: 'Cerrado' },
]

// Valores numéricos para poder animar el contador; el formato se aplica al pintar.
export const stats = [
  { id: 's1', to: 12000, prefix: '+', decimals: 0, label: 'cortes al año' },
  { id: 's2', to: 22, decimals: 0, label: 'años de oficio' },
  { id: 's3', to: 4.9, decimals: 1, label: 'estrellas en Google' },
]
