import Isotipo from "./Isotipo";
import RouterLink from "./RouterLink";

/**
 * Cabecera simple de las páginas de segundo nivel (ficha de programa, página
 * de tema): isotipo que lleva a la home y, si `conVolver`, botón "← Volver".
 * Al pasar el cursor (o enfocar) el isotipo gira y aparece "← Volver a casa".
 */
export default function PageHeader({ conVolver = true, claro = false }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <RouterLink
        to="/"
        aria-label="Volver al inicio"
        className={`group flex items-center gap-3 ${claro ? "text-noche" : "text-gris"}`}
      >
        <Isotipo className="h-8 w-8 text-naranja transition-transform duration-500 ease-out group-hover:rotate-90 group-focus-visible:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 sm:h-9 sm:w-9" />
        <span
          aria-hidden
          className="-translate-x-2 font-mono text-xs uppercase tracking-widest opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          ← Volver a casa
        </span>
      </RouterLink>
      {conVolver && (
      <RouterLink
        to="/"
        className="rounded-full border border-gris px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-gris transition-colors duration-300 hover:border-lima hover:bg-lima hover:text-noche sm:text-sm"
      >
        ← Volver
      </RouterLink>
      )}
    </header>
  );
}
