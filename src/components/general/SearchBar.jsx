import { useEffect, useMemo, useRef, useState } from "react";
import { buscar } from "../../servicios/buscar";
import { navigate } from "../../servicios/router";

const ETIQUETA_TIPO = { tema: "/Tema", programa: "/Programa", invitado: "/Invitado" };

function LupaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Buscador del header: escribe y aparece una lista con temas, programas e
 * invitados que coinciden (ver utils/buscar.js). Flechas ↑↓ para moverse,
 * Enter para abrir (el primero si no se eligió ninguno) y Esc para cerrar.
 */
export default function SearchBar() {
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [indice, setIndice] = useState(-1);
  const [pasando, setPasando] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  // Abierto con la lupa (clic, toque, Enter o Espacio): sirve donde no hay hover.
  const [manual, setManual] = useState(false);
  // Aviso para lectores de pantalla: cuántos resultados hay.
  const [mensaje, setMensaje] = useState("");
  const raiz = useRef(null);
  const campo = useRef(null);

  const resultados = useMemo(() => buscar(texto), [texto]);
  const hayConsulta = texto.trim().length >= 2;

  // Cierra la lista al tocar fuera del buscador.
  useEffect(() => {
    const alTocar = (event) => {
      if (!raiz.current?.contains(event.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", alTocar);
    return () => document.removeEventListener("pointerdown", alTocar);
  }, []);

  const cerrar = () => {
    setAbierto(false);
    setIndice(-1);
  };

  const ir = (resultado) => {
    navigate(resultado.to);
    setTexto("");
    cerrar();
    campo.current?.blur();
  };

  const alTeclear = (event) => {
    if (event.key === "ArrowDown" && resultados.length > 0) {
      event.preventDefault();
      setAbierto(true);
      setIndice((i) => (i + 1) % resultados.length);
    } else if (event.key === "ArrowUp" && resultados.length > 0) {
      event.preventDefault();
      setIndice((i) => (i <= 0 ? resultados.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const elegido = resultados[indice >= 0 ? indice : 0];
      if (elegido) ir(elegido);
    } else if (event.key === "Escape") {
      cerrar();
      campo.current?.blur();
    }
  };

  // En reposo solo se ve la lupa; la barra se despliega al pasar el cursor, al
  // enfocarla (teclado o toque en la lupa) o mientras haya texto escrito.
  const expandido = pasando || enfocado || manual || texto.length > 0;

  // Al abrir con la lupa el foco pasa al campo.
  useEffect(() => {
    if (manual) campo.current?.focus();
  }, [manual]);

  // Anuncia la cantidad de resultados una vez que la persona dejó de escribir.
  useEffect(() => {
    if (!hayConsulta) {
      setMensaje("");
      return;
    }
    const espera = setTimeout(() => {
      setMensaje(
        resultados.length === 0
          ? "Sin resultados"
          : `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`
      );
    }, 500);
    return () => clearTimeout(espera);
  }, [resultados, hayConsulta]);

  return (
    <div
      ref={raiz}
      role="search"
      className={`relative transition-[width] duration-300 ease-out ${expandido ? "w-[min(16rem,58vw)]" : "w-10"}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPasando(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPasando(false)}
      onFocus={() => setEnfocado(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setEnfocado(false);
          setManual(false);
        }
      }}
    >
      {/* En reposo el control es un botón con la lupa: se abre con clic, toque,
          Enter o Espacio. El campo de texto aparece al abrirlo. */}
      {!expandido && (
        <button
          type="button"
          aria-expanded="false"
          aria-label="Buscar un programa, tema o invitado"
          onClick={() => setManual(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gris/30 text-gris transition-colors hover:border-lima hover:bg-gris/10"
        >
          <LupaIcon />
        </button>
      )}
      <label
        className={`flex h-10 cursor-text items-center rounded-full border text-gris transition-[border-color,background-color,padding] duration-300 hover:border-lima ${
          expandido ? "gap-2 border-gris/30 bg-gris/5 px-4" : "hidden"
        } focus-within:border-lima`}
      >
        <LupaIcon />
        <span className="sr-only">Buscar un programa, tema o invitado</span>
        <input
          ref={campo}
          type="search"
          value={texto}
          placeholder="¿Qué buscás?"
          role="combobox"
          aria-expanded={abierto && hayConsulta}
          aria-controls="resultados-busqueda"
          aria-autocomplete="list"
          aria-activedescendant={abierto && hayConsulta && indice >= 0 ? `busq-op-${indice}` : undefined}
          autoComplete="off"
          onChange={(event) => {
            setTexto(event.target.value);
            setAbierto(true);
            setIndice(-1);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={alTeclear}
          className={`min-w-0 bg-transparent font-mono text-xs tracking-wide text-gris outline-none transition-opacity duration-300 placeholder:text-gris/50 [&::-webkit-search-cancel-button]:hidden ${
            expandido ? "flex-1 opacity-100" : "w-0 opacity-0"
          }`}
        />
      </label>

      <div role="status" className="sr-only">
        {mensaje}
      </div>

      {abierto && hayConsulta && (
        <ul
          id="resultados-busqueda"
          role="listbox"
          className="absolute right-0 top-full z-10 mt-3 flex max-h-[70vh] w-96 max-w-[calc(100vw-3rem)] flex-col gap-1 overflow-y-auto rounded-3xl border border-gris/25 bg-[#26263b] p-2 text-gris shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]"
        >
          {resultados.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gris/70">
              Sin resultados para «{texto.trim()}»
            </li>
          ) : (
            resultados.map((resultado, i) => {
              const activo = i === indice;
              return (
                <li key={`${resultado.tipo}-${resultado.id}`} role="presentation">
                  {/* Misma fila que en "Todos los programas": hover gris, título lima y flecha. */}
                  <a
                    href={resultado.to}
                    id={`busq-op-${i}`}
                    role="option"
                    aria-selected={activo}
                    tabIndex={-1}
                    onClick={(event) => {
                      event.preventDefault();
                      ir(resultado);
                    }}
                    onMouseEnter={() => setIndice(i)}
                    className={`flex min-h-14 items-center gap-4 rounded-2xl px-4 py-2.5 transition-colors ${
                      activo ? "bg-gris/10" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-gris/55">
                        {ETIQUETA_TIPO[resultado.tipo]}
                        {resultado.detalle ? ` · ${resultado.detalle}` : ""}
                      </span>
                      <span
                        className={`block truncate font-display text-lg font-medium leading-tight transition-colors ${
                          activo ? "text-lima" : ""
                        }`}
                      >
                        {resultado.titulo}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`shrink-0 transition-all ${
                        activo ? "translate-x-1 text-lima" : "text-gris/55"
                      }`}
                    >
                      →
                    </span>
                  </a>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
