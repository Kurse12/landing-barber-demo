import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { business, images } from '../data/site'
import { handleAnchorClick } from '../lib/scroll'
import { usePosterFit } from '../hooks/usePosterFit'

const meta = ['Desde 2003', 'Calle Principal 123', 'Buenos Aires']

export default function Hero() {
  const root = useRef(null)
  const title = useRef(null)
  const [line1, line2, line3] = business.claim.poster

  // Cada línea se mide y se escala para llenar el ancho exacto. Ver el hook:
  // estimar el cuerpo por número de caracteres recortaba letras contra el
  // margen en unos anchos y dejaba hueco en otros.
  usePosterFit(title)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        gsap.set('[data-hero-cell]', { autoAlpha: 0 })

        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

        // Las líneas suben desde debajo de su propia caja recortada.
        tl.fromTo(
          '[data-fit-line]',
          { yPercent: 108 },
          { yPercent: 0, duration: 1.2, stagger: 0.08 },
        )
          .fromTo(
            '[data-hero-strip]',
            { clipPath: 'inset(0% 100% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1 },
            '-=0.9',
          )
          .fromTo(
            '[data-hero-cell]',
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 },
            '-=0.7',
          )

        // La imagen se desplaza en sentido contrario al scroll: separa su plano
        // del plano del fondo sin usar sombra ni profundidad.
        gsap.to('[data-hero-strip-inner]', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      id="inicio"
      ref={root}
      className="flex min-h-[100dvh] flex-col justify-between overflow-hidden pt-14 md:pt-[61px]"
    >
      {/*
        Dos columnas: texto a la izquierda, imagen a la derecha, mitad y
        mitad. Bajo `sm` es una sola columna, texto arriba e imagen como
        banda debajo.
      */}
      <div className="flex flex-1 flex-col sm:flex-row">
        {/*
          El margen vive en el contenedor de afuera y el <h1> medido no tiene
          ninguno: `clientWidth` incluye el padding, así que si midiéramos un
          elemento con `px-4` las líneas saldrían 32px más anchas de lo que
          cabe y volverían a recortarse contra el borde.

          `min-w-0`: sin esto, el ancho mínimo de un ítem flex lo pone su
          contenido. Las líneas miden `w-max`, así que su propio ancho crecía
          la columna, lo que disparaba el `ResizeObserver` del fit, que volvía
          a agrandar el texto: una espiral de crecimiento en cada frame.
        */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-8 md:px-6">
          <h1 ref={title} className="flex flex-col">
            <span className="block overflow-hidden">
              <span
                data-fit-line
                className="block w-max whitespace-nowrap text-poster text-chalk"
              >
                {line1}
              </span>
            </span>

            <span className="block overflow-hidden">
              <span
                data-fit-line
                className="block w-max whitespace-nowrap text-poster text-chalk"
              >
                {line2}
              </span>
            </span>

            <span className="block overflow-hidden">
              <span
                data-fit-line
                className="block w-max whitespace-nowrap text-poster text-chalk-2"
              >
                {line3}
              </span>
            </span>
          </h1>
        </div>

        <span
          data-hero-strip
          className="relative block h-[34vh] overflow-hidden sm:h-auto sm:flex-1"
        >
          <picture>
            <source srcSet={images.hero.webp} type="image/webp" />
            <img
              data-hero-strip-inner
              src={images.hero.src}
              alt={images.hero.alt}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full scale-110 object-cover grayscale contrast-125 will-change-transform"
            />
          </picture>
        </span>
      </div>

      {/*
        Pie del cartel. La regla de arriba lo cierra contra el titular; entre
        las tres celdas ya no hay líneas, las separa el aire.
      */}
      <div className="flex flex-col gap-8 border-t-2 border-chalk px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-12 md:px-6">
        <p
          data-hero-cell
          className="max-w-sm font-mono text-sm uppercase leading-snug tracking-[0.14em] text-chalk"
        >
          {business.claim.tail}
        </p>

        <ul data-hero-cell className="flex flex-col gap-1">
          {meta.map((entry) => (
            <li key={entry} className="label">
              {entry}
            </li>
          ))}
        </ul>

        <a
          data-hero-cell
          href="#reserva"
          onClick={handleAnchorClick('reserva')}
          className="group flex items-center justify-between gap-6 border-2 border-chalk bg-chalk px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.14em] text-void transition-[background-color,color,transform] duration-150 ease-out-strong can-hover:hover:bg-void can-hover:hover:text-chalk active:translate-y-[2px]"
        >
          Sacar turno
          <span
            aria-hidden="true"
            className="text-xl transition-transform duration-150 ease-out-strong group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </a>
      </div>
    </section>
  )
}
