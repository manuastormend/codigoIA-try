import raw from '../../utils/Logos/SVG/codigo_ia_imagotipo_blanco transparente.svg?raw'

// Mismo criterio que Isotipo: viewBox recortado al dibujo y color por currentColor.
const markup = raw
  .replace(
    /<svg[^>]*>/,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="99 99 865 241" fill="none" width="100%" height="100%">'
  )
  // Los primeros 40 paths son el aro de rayos (isotipo): van en naranja de marca.
  // El resto (las letras "Código.IA") sigue el color del texto (blanco en fondos oscuros).
  .replace(/fill="white"/g, (() => {
    let i = 0
    return () => (i++ < 40 ? 'fill="var(--naranja)"' : 'fill="currentColor"')
  })())

// Variantes con el aro de rayos envuelto en un <g> (las animaciones están en index.css):
//  - intro: el aro gira solo en el medio; al frenar se corre y aparecen las letras
//    (que van en su propio <g class="letras-intro">);
//  - continuo: el aro gira sin parar (logo del header), las letras siempre visibles.
function envolverAro(claseAro, claseLetras) {
  const ini = markup.indexOf('<path')
  let fin = ini
  for (let n = 0; n < 40; n++) fin = markup.indexOf('/>', markup.indexOf('<path', fin)) + 2
  const aro = markup.slice(0, ini) + `<g class="${claseAro}">` + markup.slice(ini, fin) + '</g>'
  const resto = markup.slice(fin)
  if (!claseLetras) return aro + resto
  // El grupo con clip-path (el aro) se cierra después de los 40 paths; las letras van
  // sueltas a continuación y terminan donde empieza <defs>.
  const ini2 = resto.indexOf('</g>') + 4
  const fin2 = resto.indexOf('<defs>')
  return aro + resto.slice(0, ini2) + `<g class="${claseLetras}">` + resto.slice(ini2, fin2) + '</g>' + resto.slice(fin2)
}
const markupGira = envolverAro('aro-giro', 'letras-intro')
const markupContinuo = envolverAro('aro-giro-continuo')

/**
 * Imagotipo horizontal (isotipo naranja + letras "Código.IA"). Se dimensiona con el ANCHO
 * desde className (w-32, etc.); la altura sale de la proporción del logo.
 * Con `girar`, intro: el aro gira solo en el medio, frena, se corre y aparece el nombre; con
 * girar="continuo" gira sin parar, al ritmo de las ruedas del hero (header).
 */
export default function Imagotipo({ className = '', label = 'Código.IA', girar = false }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-block aspect-[865/241] shrink-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${girar === true ? 'logo-intro' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: girar === 'continuo' ? markupContinuo : girar ? markupGira : markup }}
    />
  )
}
