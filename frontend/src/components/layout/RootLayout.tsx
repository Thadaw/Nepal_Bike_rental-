import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { Splash } from "@/components/splash/Splash";
import { useSplash } from "@/store/splashStore";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function RootLayout() {
  const { pathname } = useLocation();
  const phase = useSplash((s) => s.phase);
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="sr-only z-50 rounded-full bg-brand-gold px-4 py-2 font-semibold text-brand-charcoal focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Splash />
      <ScrollToTop />
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* The page mounts when the logo starts moving, so its entrance animations play as the splash fades. */}
        {phase !== "loading" && (
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        )}
      </main>
      <Footer />
    </MotionConfig>
  );
}
