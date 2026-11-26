import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSplash } from "@/store/splashStore";

/** Width / height of /images/logo.webp. The splash screen uses it to size the logo. */
export const LOGO_ASPECT = 1976 / 746;
export const LOGO_SRC = "/images/logo.webp";
export const LOGO_FALLBACK_SRC = "/images/logo.png";

interface LogoProps {
  /** Logo sits on a dark background: it gets a light plate so its black outlines stay readable. */
  light?: boolean;
  className?: string;
  /** Height classes of the picture. */
  imgClassName?: string;
  /** Marks the main navbar logo: the splash screen flies its logo here and hides this one until it lands. */
  navTarget?: boolean;
}

export function Logo({ light, className, imgClassName = "h-10 sm:h-11", navTarget }: LogoProps) {
  const phase = useSplash((s) => s.phase);
  const hidden = navTarget && phase !== "done";
  return (
    <Link
      to="/"
      aria-label="Nepal Bike Rental home"
      className={cn("inline-flex shrink-0 items-center", light && "rounded-xl bg-brand-warm px-2.5 py-1.5", className)}
    >
      <picture>
        <source srcSet={LOGO_SRC} type="image/webp" />
        <img
          src={LOGO_FALLBACK_SRC}
          alt="Nepal Bike Rental"
          width={1976}
          height={746}
          decoding="async"
          data-nav-logo={navTarget ? "" : undefined}
          style={hidden ? { opacity: 0 } : undefined}
          className={cn("w-auto select-none", imgClassName)}
        />
      </picture>
    </Link>
  );
}
