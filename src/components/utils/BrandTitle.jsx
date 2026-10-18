import { motion } from "framer-motion";
import Imagotipo from "./Imagotipo";

/**
 * El imagotipo oficial de Código.IA en sus dos estados.
 * El layoutId compartido es lo que le permite a Framer Motion animar
 * la transformación de "título grande centrado" a "logo chico en el header",
 * en vez de tratarlos como dos elementos distintos con fade cruzado.
 *
 * En su primera aparición (variant="large") entra chico y transparente,
 * y crece hasta su tamaño final.
 */
export default function BrandTitle({ variant = "large", alTerminarViaje }) {
  const isLarge = variant === "large";

  return (
    <motion.div
      layoutId="brand"
      onLayoutAnimationComplete={alTerminarViaje}
      initial={isLarge ? { opacity: 0, scale: 0.4 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
        // El viaje del logo grande al header (animación de layout) es más lento y parejo.
        layout: { duration: 2.2, ease: [0.65, 0, 0.35, 1] },
      }}
      className="flex select-none items-center text-gris will-change-transform"
    >
      <Imagotipo
        className={isLarge ? "w-[78vw] sm:w-[48vw]" : "w-32 sm:w-36"}
      />
    </motion.div>
  );
}
