// Este sitio es una demo: los enlaces a WhatsApp, redes y mapa no llevan a
// ningún destino real. En vez de navegar, avisan por qué no lo hacen. Un
// CustomEvent alcanza para eso: no hace falta un context para un aviso que
// vive fuera del árbol de React.
const EVENT_NAME = 'demo-toast'

export function showDemoToast(message) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { message } }))
}

export function onDemoToast(callback) {
  const handler = (event) => callback(event.detail.message)
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}
