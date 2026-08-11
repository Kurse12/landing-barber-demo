import { useEffect } from 'react'

/**
 * Ajusta cada línea del titular para que llene exactamente el ancho disponible.
 *
 * La alternativa era calcular un `vw` por línea a ojo, contando caracteres y
 * estimando el avance medio de la fuente. No funciona: el avance real depende
 * de qué letras son (una línea de C, O y S es mucho más ancha que una de I, T y
 * L), así que el mismo `vw` que entra justo en una línea recorta la siguiente.
 *
 * Acá se mide. Se pone la línea a un cuerpo de referencia, se lee el ancho real
 * que ocupa y se escala por regla de tres. El interletrado va en `em`, así que
 * escala solo.
 *
 * `ratio` permite que una línea ocupe una fracción del ancho en vez de todo,
 * para las que comparten renglón con otra cosa. Solo se aplica a partir de
 * `sm`: por debajo, cada línea va a ancho completo.
 */
export function usePosterFit(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let frame = 0
    let cancelled = false

    const fit = () => {
      const available = root.clientWidth
      if (!available) return

      const wide = window.matchMedia('(min-width: 640px)').matches

      root.querySelectorAll('[data-fit-line]').forEach((line) => {
        const ratio = wide ? Number(line.dataset.fitRatio || 1) : 1

        // Cuerpo de referencia, medida, y de ahí el definitivo. Son dos
        // cálculos de layout por línea; con tres líneas y solo al redimensionar
        // es irrelevante.
        line.style.fontSize = '100px'
        const measured = line.scrollWidth
        if (!measured) return

        line.style.fontSize = `${(available * ratio * 100) / measured}px`
      })
    }

    /*
      Hay que esperar a la fuente. Archivo Black tarda en llegar y, mientras,
      el navegador mide con la de reserva, que tiene otro avance: el titular
      quedaría cuadrado al ancho equivocado.
    */
    document.fonts.ready.then(() => {
      if (!cancelled) fit()
    })
    fit()

    // El ancho cambia al girar el teléfono y al aparecer la barra del
    // navegador. ResizeObserver lo cubre sin escuchar `resize` a mano.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fit)
    })
    observer.observe(root)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [rootRef])
}
