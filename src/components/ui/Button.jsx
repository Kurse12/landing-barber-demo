const base =
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden ' +
  'font-sans text-xs font-medium uppercase tracking-[0.18em] transition-colors ' +
  'duration-300 disabled:pointer-events-none disabled:opacity-50'

const sizes = {
  md: 'px-7 py-4',
  sm: 'px-5 py-3 text-[0.7rem]',
}

const variants = {
  // El relleno entra desde abajo en hover, sin cambiar el layout.
  primary:
    'bg-brass text-ink hover:text-ink before:absolute before:inset-0 before:-z-0 ' +
    'before:origin-bottom before:scale-y-0 before:bg-bone before:transition-transform ' +
    'before:duration-400 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-y-100',
  ghost:
    'border border-line text-bone hover:border-brass hover:text-brass ' +
    'before:absolute before:inset-0 before:-z-0 before:origin-bottom before:scale-y-0 ' +
    'before:bg-surface before:transition-transform before:duration-400 ' +
    'before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-y-100',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      <span className="relative z-10">{children}</span>
    </Tag>
  )
}
