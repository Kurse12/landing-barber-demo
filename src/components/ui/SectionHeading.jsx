import Reveal from './Reveal'

export default function SectionHeading({ index, eyebrow, title, subtitle, align = 'left' }) {
  return (
    <header className={align === 'center' ? 'text-center' : ''}>
      <Reveal className="flex items-center gap-4">
        {index && <span className="font-sans text-xs text-brass-dim tabular-nums">{index}</span>}
        <span className="eyebrow">{eyebrow}</span>
        <span className="h-px flex-1 bg-line" />
      </Reveal>

      <Reveal as="h2" delay={0.08} className="mt-6 text-section text-bone">
        {title}
      </Reveal>

      {subtitle && (
        <Reveal as="p" delay={0.14} className="mt-4 max-w-xl text-muted">
          {subtitle}
        </Reveal>
      )}
    </header>
  )
}
