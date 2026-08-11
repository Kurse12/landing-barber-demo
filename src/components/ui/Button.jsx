/*
  Bloque de acción. Sin color de acento, la jerarquía la lleva la inversión: el
  primario es una plancha de tiza con el tipo calado en negro, y al pasar por
  encima se da vuelta. En un cartel el estado no se funde, se conmuta.

  La regla del primario solo se ve cuando el fondo desaparece, así que en reposo
  no le suma ninguna línea a la página.

  El `:active` hunde el bloque 2px en vez de escalarlo. Escalar es el gesto de
  una superficie de cristal; hundir es el de algo impreso que se aprieta.
*/
const variants = {
  primary: 'border-2 border-chalk bg-chalk text-void hover:bg-void hover:text-chalk',
  ghost:
    'border-2 border-chalk-3 bg-transparent text-chalk hover:border-chalk hover:bg-chalk hover:text-void',
}

const sizes = {
  md: 'px-8 py-4 text-xs',
  sm: 'px-5 py-3 text-[0.68rem]',
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
    <Tag
      className={`block-cta ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
