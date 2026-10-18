import { partirInline } from "../../servicios/texto";

/**
 * Renderiza un texto largo de los JSON: separa párrafos por línea en blanco,
 * respeta los saltos de línea simples e interpreta **negrita**, *cursiva* y
 * links sueltos. Si no hay texto no renderiza nada.
 */
export default function Texto({ children, className = "" }) {
  if (!children) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {children.split(/\n\s*\n/).map((parrafo, i) => (
        <p key={i} className="whitespace-pre-line">
          {partirInline(parrafo).map((trozo, j) => {
            if (trozo.startsWith("**")) return <strong key={j}>{trozo.slice(2, -2)}</strong>;
            if (trozo.startsWith("*")) return <em key={j}>{trozo.slice(1, -1)}</em>;
            if (/^https?:\/\//.test(trozo)) {
              return (
                <a
                  key={j}
                  href={trozo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all underline decoration-lima underline-offset-4 hover:text-lima"
                >
                  {trozo}<span className="sr-only"> (abre en una pestaña nueva)</span>
                </a>
              );
            }
            return trozo;
          })}
        </p>
      ))}
    </div>
  );
}
