/**
 * Interruptor único de la política de movimiento.
 *
 * `false` → animamos para todo el mundo, ignorando `prefers-reduced-motion`.
 * `true`  → respetamos la preferencia del sistema y no animamos nada.
 *
 * Estaba en `false` mientras la página animaba poco. El rediseño subió bastante
 * la carga de movimiento (pin, pan horizontal, preview siguiendo el cursor), y
 * con ese volumen el parallax y el scroll suave pueden marear a personas con
 * trastornos vestibulares. WCAG 2.3.3 y 2.2.2 esperan poder desactivarlo, así
 * que ahora se respeta la preferencia del sistema.
 *
 * Volver atrás es cambiar esta constante: ningún componente lee la media query
 * por su cuenta.
 */
export const RESPECT_REDUCED_MOTION = true

/** Consulta puntual, fuera de React. */
export function prefersReducedMotion() {
  if (!RESPECT_REDUCED_MOTION) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Media query para `gsap.matchMedia`: 'all' casa siempre. */
export const MOTION_QUERY = RESPECT_REDUCED_MOTION
  ? '(prefers-reduced-motion: no-preference)'
  : 'all'
