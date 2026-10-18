import proyecto from "../../data/proyecto.json"

// Los campos salen de proyecto.json (contacto.campos); acá solo se decide
// qué tipo de control usa cada uno. Los que no figuran son texto simple.
const TIPOS = { correo: "email", mensaje: "textarea" }
const AUTOCOMPLETE = { nombre: "name", correo: "email" }

const CLASE_CAMPO =
  "rounded-2xl border border-noche/15 bg-gris px-5 py-3 text-base text-noche transition-colors placeholder:text-noche/70 focus:border-noche focus:bg-white focus:outline-none"

// "+" que se vuelve "−" al abrir el desplegable (el mismo de "Sobre el proyecto").
const LINEA = "before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-noche before:content-[''] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-noche after:content-['']"

/**
 * Formulario de contacto: por ahora solo UI, sin envío real.
 * Cuando se defina un servicio (EmailJS, Formspree, backend propio),
 * handleSubmit es el único lugar que hay que tocar.
 */
export default function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: conectar a un servicio de envío cuando se decida cuál usar.
  }

  return (
    <section id="contacto" className="seccion-curva tx tx-cuadricula-claro bg-lila text-noche">
    <div className="mx-auto max-w-3xl px-6 py-14 sm:px-10 sm:py-20">
      <details className="group rounded-3xl border border-noche/10 bg-white shadow-suave">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-6 py-4 font-display text-xl font-semibold tracking-tight sm:px-8 sm:text-2xl [&::-webkit-details-marker]:hidden">
          Escribinos
          <span
            aria-hidden
            className={`relative h-9 w-9 shrink-0 rounded-full bg-lima transition-transform duration-200 group-hover:scale-110 before:h-0.5 before:w-4 after:h-4 after:w-0.5 group-open:after:hidden ${LINEA}`}
          />
        </summary>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-8 pt-1 sm:px-8">
        {proyecto.contacto.campos.map((campo) => {
          const comun = { id: `campo-${campo.id}`, name: campo.id, className: CLASE_CAMPO }
          return (
            <div key={campo.id} className="flex flex-col gap-1.5">
              <label htmlFor={comun.id} className="font-mono text-[11px] uppercase tracking-widest text-noche/70">
                {campo.etiqueta}
              </label>
              {TIPOS[campo.id] === "textarea" ? (
                <textarea {...comun} rows={4} />
              ) : (
                <input {...comun} type={TIPOS[campo.id] ?? "text"} autoComplete={AUTOCOMPLETE[campo.id]} />
              )}
            </div>
          )
        })}
        <button
          type="submit"
          className="mt-4 w-fit rounded-full bg-noche px-8 py-3.5 text-sm font-medium text-gris transition duration-200 hover:-translate-y-0.5 hover:bg-lima hover:text-noche"
        >
          Mandalo
        </button>
      </form>
      </details>
    </div>
    </section>
  )
}
