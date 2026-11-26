import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { LOGO_ASPECT, LOGO_SRC } from "@/components/common/Logo";
import { useSplash } from "@/store/splashStore";

const MIN_SHOW_MS = 2800; // the logo stays at least this long before it starts moving
const MAX_WAIT_MS = 6000; // never hold the visitor longer than this, even if the logo is slow to load
const MOVE_S = 1.1;
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const LIME = "#C6F801"; // the green of the logo
const RAY_DELAY_S = 0.9; // the ray starts once the logo has faded in
const RAY_S = 1.3;

/** Paints a moving band of light, but only where the logo has pixels (fill and black outline). */
const rayLayer = (band: string, extra: CSSProperties = {}): CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, transparent 0%, transparent 44%, ${band} 50%, transparent 56%, transparent 100%)`,
  backgroundSize: "250% 100%",
  backgroundRepeat: "no-repeat",
  WebkitMaskImage: `url(${LOGO_SRC})`,
  maskImage: `url(${LOGO_SRC})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  animation: `splash-ray ${RAY_S}s cubic-bezier(0.45, 0, 0.25, 1) ${RAY_DELAY_S}s infinite backwards`,
  ...extra,
});

interface Geometry { left: number; top: number; width: number; height: number }
interface Move { x: number; y: number; scale: number }

function startGeometry(): Geometry {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw * 0.78, 560);
  const height = width / LOGO_ASPECT;
  return { left: (vw - width) / 2, top: (vh - height) / 2 - 28, width, height };
}

/**
 * Full-screen loading screen. The logo fades in at the centre, a bar fills underneath,
 * then the logo travels to the navbar logo spot while the screen fades away.
 */
export function Splash() {
  const phase = useSplash((s) => s.phase);
  const setPhase = useSplash((s) => s.setPhase);
  const [geo] = useState<Geometry>(() => startGeometry());
  const [move, setMove] = useState<Move | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const mountedAt = useRef(performance.now());

  // Keep the page still while the splash is up.
  useLayoutEffect(() => {
    if (phase === "done") return;
    window.scrollTo(0, 0);
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = previous; };
  }, [phase === "done"]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wait for the logo to load, show it for a minimum time, then start the move.
  useEffect(() => {
    if (phase !== "loading") return;
    let cancelled = false;
    let timer: number | undefined;

    const begin = () => {
      if (cancelled || phaseRef.current !== "loading") return;
      const target = document.querySelector<HTMLElement>("[data-nav-logo]");
      if (target) {
        const r = target.getBoundingClientRect();
        setMove({
          scale: r.width / geo.width,
          x: r.left + r.width / 2 - (geo.left + geo.width / 2),
          y: r.top + r.height / 2 - (geo.top + geo.height / 2),
        });
      }
      setPhase("moving");
    };

    const img = new Image();
    const onReady = () => {
      const elapsed = performance.now() - mountedAt.current;
      timer = window.setTimeout(begin, Math.max(0, MIN_SHOW_MS - elapsed));
    };
    img.onload = onReady;
    img.onerror = onReady;
    img.src = LOGO_SRC;
    const fallback = window.setTimeout(begin, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(fallback);
    };
  }, [phase, setPhase, geo]);

  // End the flight on a fixed clock so a busy first render cannot cut it short.
  useEffect(() => {
    if (phase !== "moving") return;
    const finish = window.setTimeout(() => {
      if (phaseRef.current === "moving") setPhase("done");
    }, MOVE_S * 1000 + 100);
    return () => window.clearTimeout(finish);
  }, [phase, setPhase]);

  if (phase === "done") return null;
  const moving = phase === "moving";

  return (
    <div role="status" aria-label="Loading Nepal Bike Rental" className="pointer-events-none">
      {/* Backdrop */}
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[100] bg-brand-warm"
        style={{ pointerEvents: moving ? "none" : "auto" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: moving ? 0 : 1 }}
        transition={{ duration: 0.6, delay: moving ? MOVE_S * 0.45 : 0, ease: "easeInOut" }}
      />

      {/* Logo: the box travels, the picture inside fades in once */}
      <motion.div
        className="fixed z-[101]"
        style={{ left: geo.left, top: geo.top, width: geo.width, height: geo.height }}
        initial={false}
        animate={moving ? (move ? { x: move.x, y: move.y, scale: move.scale } : { opacity: 0 }) : { x: 0, y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: MOVE_S, ease: EASE }}
      >
        <motion.img
          src={LOGO_SRC}
          alt=""
          width={1976}
          height={746}
          draggable={false}
          className="h-full w-full select-none"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Light ray: a soft lime glow under a bright white core, both clipped to the logo's shape. */}
        {!moving && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-0" style={rayLayer("rgba(198,248,1,1)", { filter: "blur(5px)", opacity: 0.9 })} />
            <div aria-hidden className="pointer-events-none absolute inset-0" style={rayLayer("rgba(255,255,255,1)")} />
          </>
        )}
      </motion.div>

      {/* Loading bar */}
      <motion.div
        aria-hidden
        className="fixed z-[101] flex flex-col items-center gap-3"
        style={{ left: 0, right: 0, top: geo.top + geo.height + 36 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: moving ? 0 : 1 }}
        transition={{ duration: moving ? 0.25 : 0.5, delay: moving ? 0 : 0.4 }}
      >
        <div className="h-1.5 w-[min(240px,60vw)] overflow-hidden rounded-full bg-brand-charcoal/10">
          <motion.div
            className="h-full origin-left rounded-full"
            style={{ background: LIME, boxShadow: "inset 0 0 0 1px rgba(21,23,25,.55)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: MIN_SHOW_MS / 1000 - 0.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </div>
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-charcoal/55">Pokhara, Nepal</p>
      </motion.div>
    </div>
  );
}
