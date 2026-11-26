import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { phoneLine, shop } from "@/config/shop";
import { buildInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/bikes", label: "Bikes" },
  { to: "/scooty", label: "Scooty" },
  { to: "/policies", label: "Policies" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

/** Vehicles that are available on request sit under "Other". */
const otherLinks = [
  { to: "/cars", label: "Cars" },
  { to: "/jeeps", label: "Jeeps" },
];

function OtherMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const { pathname } = useLocation();
  const active = otherLinks.some((l) => pathname.startsWith(l.to));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // A short delay on leave stops the menu from closing while the pointer crosses the gap.
  const show = () => { window.clearTimeout(timer.current); setOpen(true); };
  const hide = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), 120); };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn("flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors", active || open ? "bg-secondary text-brand-charcoal" : "text-muted-foreground hover:bg-secondary/60 hover:text-brand-charcoal")}
      >
        Other <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 w-44 pt-2">
          <div className="overflow-hidden rounded-xl border bg-card p-1.5 shadow-xl shadow-black/10">
            {otherLinks.map((l) => (
              <Link key={l.to} to={l.to} role="menuitem" className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">{l.label}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-full px-3.5 py-2 text-sm font-medium transition-colors", isActive ? "bg-secondary text-brand-charcoal" : "text-muted-foreground hover:bg-secondary/60 hover:text-brand-charcoal");

/** Thin strip above the header: where we are, what is included, how to reach us. Desktop only. */
function TopBar() {
  const wa = buildWhatsAppUrl(buildInquiryMessage());
  return (
    <div className="hidden bg-brand-charcoal text-xs text-brand-warm/75 md:block">
      <div className="container flex h-9 items-center justify-between gap-4">
        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-gold" aria-hidden /> {shop.addressOneLine}</p>
        <p className="hidden lg:block">Free rider helmet <span className="mx-1.5 text-brand-gold">·</span> No kilometre limit <span className="mx-1.5 text-brand-gold">·</span> Pay the rest on return</p>
        <p className="flex items-center gap-5">
          {phoneLine && <a href={`tel:${phoneLine.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1.5 transition-colors hover:text-brand-gold"><Phone className="h-3.5 w-3.5" aria-hidden /> {phoneLine}</a>}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-brand-gold"><MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp</a>}
          {!phoneLine && !wa && shop.openingHours && <span>{shop.openingHours}</span>}
        </p>
      </div>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const wa = buildWhatsAppUrl(buildInquiryMessage());

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <TopBar />
      <header className={cn("sticky top-0 z-40 transition-all duration-300", scrolled || open ? "border-b bg-background/90 shadow-sm shadow-black/5 backdrop-blur-md" : "bg-background")}>
        <div className="container flex h-16 items-center justify-between gap-4 lg:gap-6">
          <Logo navTarget imgClassName="h-9 sm:h-11" />
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navLinkClass}>{l.label}</NavLink>)}
            <OtherMenu />
          </nav>
          <div className="flex items-center gap-2">
            {wa && (
              <Button asChild variant="outline" size="icon" className="hidden sm:inline-flex" aria-label="Chat on WhatsApp">
                <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden /></a>
              </Button>
            )}
            <Button asChild size="sm" variant="gold">
              <Link to="/bikes">Book Now <ArrowRight aria-hidden /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="container flex flex-col gap-1 pb-6 pt-2">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => cn("rounded-lg px-3 py-3 font-heading text-lg font-semibold", isActive ? "bg-secondary" : "text-muted-foreground")}>
                    {l.label}
                  </NavLink>
                ))}
                <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Other</p>
                {otherLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("rounded-lg px-3 py-3 font-heading text-lg font-semibold", isActive ? "bg-secondary" : "text-muted-foreground")}>
                    {l.label}
                  </NavLink>
                ))}
                <div className="mt-4 grid gap-3 border-t pt-4">
                  <Button asChild size="lg" variant="gold"><Link to="/bikes">Book Now <ArrowRight aria-hidden /></Link></Button>
                  {(wa || phoneLine) && (
                    <div className="grid grid-cols-2 gap-3">
                      {wa && <Button asChild variant="whatsapp"><a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden /> WhatsApp</a></Button>}
                      {phoneLine && <Button asChild variant="outline"><a href={`tel:${phoneLine.replace(/[^\d+]/g, "")}`}><Phone aria-hidden /> Call</a></Button>}
                    </div>
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" aria-hidden /> {shop.addressOneLine}</p>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
