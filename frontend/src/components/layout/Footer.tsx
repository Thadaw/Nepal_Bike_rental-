import { Link } from "react-router-dom";
import { ArrowUp, Clock, Facebook, Instagram, MapPin, Navigation, Phone } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { mapDirectionsUrl, phoneLine, shop } from "@/config/shop";

const cols = [
  { title: "Rent", links: [["Book now", "/bikes"], ["Bikes", "/bikes"], ["Scooties", "/scooty"], ["Cars (on request)", "/cars"], ["Jeeps (on request)", "/jeeps"]] },
  { title: "Company", links: [["About us", "/about"], ["Rental policies", "/policies"], ["Contact", "/contact"]] },
] as const;

const linkClass = "transition-colors hover:text-brand-gold focus-visible:text-brand-gold";

export function Footer() {
  const socials = [
    { href: shop.social.facebook, label: "Facebook", Icon: Facebook },
    { href: shop.social.instagram, label: "Instagram", Icon: Instagram },
  ].filter((s): s is { href: string; label: string; Icon: typeof Facebook } => !!s.href);

  return (
    <footer className="mt-24 bg-brand-charcoal text-brand-warm/75">
      <div className="h-1 bg-gradient-to-r from-brand-golddeep via-brand-gold to-brand-golddeep" aria-hidden />
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">Bikes and scooties for Pokhara and the Himalayan roads beyond. One friendly shop, clear rules and no kilometre limit.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <WhatsAppButton message={buildInquiryMessage()} label="Chat on WhatsApp" size="sm" />
            {phoneLine && (
              <a href={`tel:${phoneLine.replace(/[^\d+]/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-medium text-brand-warm transition hover:border-brand-gold hover:text-brand-gold"><Phone className="h-4 w-4" aria-hidden /> Call the shop</a>
            )}
          </div>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-3" aria-label="Social media">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-brand-gold hover:text-brand-gold"><Icon className="h-4 w-4" /></a></li>
              ))}
            </ul>
          )}
        </div>

        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="lg:col-span-2">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-warm">{c.title}</h3>
            <ul className="space-y-3 text-sm">
              {c.links.map(([label, to]) => <li key={label}><Link className={linkClass} to={to}>{label}</Link></li>)}
            </ul>
          </nav>
        ))}

        <div className="sm:col-span-2 lg:col-span-4">
          <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-brand-warm">Visit the shop</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden /><address className="not-italic"><strong className="block font-semibold text-brand-warm">{shop.name}</strong>{shop.addressLines.join(", ")}</address></li>
            {phoneLine && <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden />{phoneLine}</li>}
            {shop.openingHours && <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden />{shop.openingHours}</li>}
          </ul>
          <a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-gold underline-offset-4 hover:underline`}><Navigation className="h-4 w-4" aria-hidden /> Get directions</a>
          <p className="mt-5 text-xs leading-relaxed text-brand-warm/55">{shop.collectionNotice}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-brand-warm/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {shop.name}, Pokhara, Nepal. Prices in NPR. Images are illustrative.</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li><Link to="/policies" className={linkClass}>Rental policies</Link></li>
            <li><Link to="/contact" className={linkClass}>Contact</Link></li>
            <li><Link to="/admin" className={linkClass}>Staff login</Link></li>
            <li><a href="#main" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`inline-flex items-center gap-1 ${linkClass}`}>Back to top <ArrowUp className="h-3.5 w-3.5" aria-hidden /></a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
