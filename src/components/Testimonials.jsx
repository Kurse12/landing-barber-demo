import { testimonials } from '../data/site'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

function Stars({ rating }) {
  return (
    <p aria-label={`${rating} de 5 estrellas`} className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < rating ? 'text-brass' : 'text-line'}
        >
          ★
        </span>
      ))}
    </p>
  )
}

export default function Testimonials() {
  return (
    <section id="opiniones" className="border-b border-line bg-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-32">
        <SectionHeading
          index="05"
          eyebrow="La gente"
          title="Lo que dicen"
          subtitle="Opiniones reales de clientes de la casa."
        />

        <ul className="mt-16 grid gap-px bg-line md:grid-cols-3">
          {testimonials.map((item, i) => (
            <Reveal
              as="li"
              key={item.id}
              delay={i * 0.1}
              className="group relative flex flex-col bg-ink p-8 transition-colors duration-500 hover:bg-surface lg:p-10"
            >
              <span
                aria-hidden="true"
                className="font-display text-6xl leading-none text-brass-dim transition-colors duration-500 group-hover:text-brass"
              >
                &ldquo;
              </span>

              <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-bone/90">
                {item.text}
              </blockquote>

              <footer className="mt-8 flex items-center justify-between border-t border-line pt-5">
                <cite className="not-italic font-sans text-xs uppercase tracking-[0.16em] text-muted">
                  {item.name}
                </cite>
                <Stars rating={item.rating} />
              </footer>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
