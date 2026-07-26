// Puente entre Lenis y el resto de la app: los enlaces del nav necesitan
// pedirle el scroll a Lenis, no al navegador, o pelean entre sí.
let lenis = null

export function setLenis(instance) {
  lenis = instance
}

export function scrollToId(id, { offset = 0 } = {}) {
  const target = document.getElementById(id)
  if (!target) return

  if (lenis) {
    lenis.scrollTo(target, { offset })
  } else {
    // Sin Lenis (movimiento reducido): salto nativo, que respeta la preferencia.
    target.scrollIntoView({ block: 'start' })
  }
}

// Handler listo para usar en <a href="#id">: mantiene el href como fallback.
export function handleAnchorClick(id, onDone) {
  return (event) => {
    event.preventDefault()
    scrollToId(id)
    onDone?.()
  }
}
