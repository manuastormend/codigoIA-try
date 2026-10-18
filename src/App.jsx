import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRoute } from "./servicios/router";
import IntroHeader from "./components/general/IntroHeader";
import ThemeSection from "./components/temas/ThemeSection";
import SeasonCarousel from "./components/general/Carousel";
import AditionalSection from "./components/adicional/AditionalSection";
import AllSection from "./components/general/AllSection";
import AboutSection from "./components/general/AboutSection";
import ContactForm from "./components/general/ContactForm";
import Footer from "./components/general/Footer";
// Las páginas internas se descargan recién cuando se entra a ellas (la home carga más liviana).
const ProgramPage = lazy(() => import("./components/program/ProgramPage"));
const ThemePage = lazy(() => import("./components/temas/ThemePage"));

// Único "nivel de profundidad" por ahora: la ficha de un programa. El id es
// el slug del programa en programas.json (ej. /programa/arte-e-ia).
const RUTA_PROGRAMA = /^\/programa\/([^/]+)\/?$/;
// Página de un tema o subtema del mapa; el id es el de temas.json.
const RUTA_TEMA = /^\/temas\/([^/]+)\/?$/;

// La intro (título grande que se vuelve header) se muestra una sola vez por
// carga de la página. Vive a nivel de módulo (y no en el estado de Home)
// porque al ir a la ficha de un programa Home se desmonta, y al volver se
// montaría de cero repitiendo la intro. Al recargar el navegador el módulo se
// evalúa de nuevo y la intro vuelve a verse.
let introYaVista = false;

export default function App() {
  const pathname = useRoute();
  const matchPrograma = pathname.match(RUTA_PROGRAMA);
  const matchTema = pathname.match(RUTA_TEMA);

  // Accesibilidad en la navegación entre páginas (el router no recarga): al
  // cambiar de ruta se mueve el foco al título de la página y se anuncia su
  // nombre en una región "status" para lectores de pantalla.
  const [anuncio, setAnuncio] = useState("");
  const primeraCarga = useRef(true);
  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    const enfocar = () => {
      const titulo = document.querySelector("main h1");
      if (!titulo) return false;
      titulo.setAttribute("tabindex", "-1");
      titulo.focus({ preventScroll: true });
      setAnuncio(document.title);
      return true;
    };
    // La página interna puede tardar en descargarse: si no está a los 200 ms, se reintenta.
    const espera = setTimeout(() => {
      if (!enfocar()) setTimeout(enfocar, 600);
    }, 200);
    return () => clearTimeout(espera);
  }, [pathname]);

  let contenido;
  if (matchPrograma) {
    contenido = <ProgramPage id={decodeURIComponent(matchPrograma[1])} />;
  } else if (matchTema) {
    contenido = <ThemePage id={decodeURIComponent(matchTema[1])} />;
  } else {
    contenido = <Home />;
  }

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lima focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-noche"
      >
        Saltar al contenido
      </a>
      <div role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </div>
      <Suspense fallback={<div className="min-h-screen bg-noche" />}>{contenido}</Suspense>
    </>
  );
}

function Home() {
  const [introDone, setIntroDone] = useState(introYaVista);

  useEffect(() => {
    document.title = "Código.IA · El programa que te ayuda a no estar re perdido con la IA";
  }, []);

  // Al volver desde otra página con un ancla (ej. "/#temas" desde ThemePage)
  // baja a esa sección una vez montada la home.
  useEffect(() => {
    if (!introDone || !window.location.hash) return;
    document.querySelector(window.location.hash)?.scrollIntoView();
  }, [introDone]);

  return (
    <div className="min-h-screen w-full bg-negro">
      <IntroHeader
        skip={introYaVista}
        onIntroDone={() => {
          introYaVista = true;
          setIntroDone(true);
        }}
      />

      {/* El resto de la página se arma mientras suena la intro (oculto) y se muestra
          cuando "Código IA" termina de asentarse en el header: así el trabajo pesado
          de montar todo no cae justo al final de la animación y no se traba. */}
      <main id="contenido" tabIndex={-1} hidden={!introDone} className={`pt-20 outline-none sm:pt-24 ${introDone ? "entrada-home" : ""}`}>
        <SeasonCarousel activo={introDone} />
        <ThemeSection />
        <AditionalSection />
        <AllSection />
        <AboutSection />
        <ContactForm />
      </main>

      <div style={{ display: introDone ? "contents" : "none" }}>
        <Footer />
      </div>
    </div>
  );
}
