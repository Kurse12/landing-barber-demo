import { useRef } from 'react'
import { gsap, useGSAP, motionSafe } from '../lib/gsap'
import { business, images, stats } from '../data/site'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

const values = [
  {
    id: 'v1',
    title: 'Oficio, no moda',
    text: 'Tijera, navaja y máquina. Técnicas de siempre aplicadas a lo que usás hoy.',
  },
  {
    id: 'v2',
    title: 'Tu tiempo importa',
    text: 'Trabajamos solo con turno para que entres y salgas a horario.',
  },
  {
    id: 'v3',
    title: 'Producto honesto',
    text: 'Cosmética natural argentina, sin siliconas ni promesas raras.',
  },
]

const formatStat = (value, decimals) =>
  value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export default function About() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = motionSafe(() => {
        gsap.fromTo(
          '[data-about-media]',
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: { trigger: '[data-about-media]', start: 'top 88%' },
          },
        )

        gsap.to('[data-about-media-inner]', {
          yPercent: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-about-media]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        /*
          Contadores: animamos un objeto plano y escribimos el texto ya
          formateado. Animar el nodo directo obligaría a reformatear con
          toLocaleString en cada frame, que es caro.
        */
        stats.forEach((stat) => {
          const el = root.current.querySelector(`[data-counter="${stat.id}"]`)
          if (!el) return
          const proxy = { value: 0 }
          gsap.to(proxy, {
            value: stat.to,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            onUpdate: () => {
              el.textContent = `${stat.prefix ?? ''}${formatStat(proxy.value, stat.decimals)}`
            },
          })
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section id="nosotros" ref={root} className="bg-void-2">
      <div className="shell pb-16 pt-24 md:pt-32">
        <SectionHeading title="La casa" meta="Desde 2003" className="max-w-5xl" />

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal as="p" delay={0.08} className="max-w-xl leading-relaxed text-chalk-2">
            {business.name} abrió en 2003 en un local de barrio con dos sillones de
            segunda mano. Veintidós años después seguimos en el mismo lugar, con los
            mismos sillones restaurados y bastantes más clientes.
          </Reveal>

          <Reveal as="p" delay={0.14} className="max-w-xl leading-relaxed text-chalk-2">
            No somos un lugar de moda: somos la barbería a la que volvés. Acá te
            preguntamos qué querés, te decimos qué te va a quedar bien y te lo hacemos
            igual de bien un martes a la mañana que un viernes a última hora.
          </Reveal>
        </div>
      </div>

      {/* Banda a sangre: el respiro visual de la sección. Sin reglas propias,
          la separan el aire de arriba y de abajo. */}
      <div data-about-media className="relative h-[45vh] overflow-hidden md:h-[62vh]">
        <img
          data-about-media-inner
          src={images.about.src}
          alt={images.about.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-115 object-cover grayscale contrast-125 will-change-transform"
        />
      </div>

      <div className="shell pb-24 pt-20 md:pb-32">
        {/*
          Cifras a cuerpo de cartel, sin celdas dibujadas. Lo que las alinea en
          columna es que van en mono tabular y que las etiquetas comparten línea
          de base; una regla vertical entre ellas no aportaría nada que el
          espacio no esté haciendo ya.
        */}
        <dl className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
          {stats.map((stat) => (
            // flex-col-reverse: el número se ve arriba, pero en el DOM el <dt>
            // va antes que su <dd>, como pide la semántica de <dl>.
            <Reveal key={stat.id} className="flex flex-col-reverse">
              <dt className="label mt-3">{stat.label}</dt>
              <dd
                data-counter={stat.id}
                className="font-display text-mega tabular-nums text-chalk"
              >
                {`${stat.prefix ?? ''}${formatStat(stat.to, stat.decimals)}`}
              </dd>
            </Reveal>
          ))}
        </dl>

        <ul className="mt-28 grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-10">
          {values.map((value, i) => (
            <Reveal as="li" key={value.id} delay={i * 0.07}>
              <h3 className="text-2xl text-chalk md:text-3xl">{value.title}</h3>
              <p className="mt-4 max-w-sm leading-relaxed text-chalk-2">{value.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
