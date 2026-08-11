import { useSmoothScroll } from './hooks/useSmoothScroll'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Services from './components/Services'
import About from './components/About'
import Team from './components/Team'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Booking from './components/Booking'
import Footer from './components/Footer'
import MobileBar from './components/MobileBar'
import Toast from './components/ui/Toast'

export default function App() {
  useSmoothScroll()

  return (
    <>
      {/* Grano: fijo y sin eventos, nunca sobre un contenedor que scrollea. */}
      <div className="grain" aria-hidden="true" />

      <Navbar />
      {/*
        `overflow-x: clip`, no `hidden`. Poner `hidden` en un solo eje obliga al
        navegador a calcular el otro como `auto`, lo que convertiría <main> en
        un contenedor de scroll y dejaría sin efecto el pin de ScrollTrigger.
        `clip` recorta el desborde lateral sin tocar el eje vertical.
      */}
      <main className="w-full max-w-full overflow-x-clip">
        <Hero />
        <Marquee />
        <Services />
        <About />
        <Team />
        <Gallery />
        <Testimonials />
        <Booking />
      </main>
      <Footer />

      {/* Va al final del árbol: sus ScrollTrigger apuntan a #inicio y #reserva,
          que tienen que existir en el DOM cuando se crean. */}
      <MobileBar />
      <Toast />
    </>
  )
}
