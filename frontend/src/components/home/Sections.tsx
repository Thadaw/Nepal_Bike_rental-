import { Link } from "react-router-dom";
import { ArrowRight, Bike, CalendarCheck, Clock, HardHat, MapPin, Navigation, Phone, Route, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/common/SectionHeading";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { faqs, reasons, steps } from "@/data/content";
import { usePublicReviews } from "@/features/reviews/hooks";
import { summarize } from "@/features/reviews/summary";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Stars } from "@/components/reviews/Stars";
import { usePricing } from "@/features/pricing/hooks";
import { pricingConfig } from "@/config/pricing";
import { mapDirectionsUrl, mapEmbedUrl, phoneLine, shop } from "@/config/shop";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { calculateQuote, formatNpr } from "@/lib/pricing";

const featureBar = {
  className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-white/10 px-6 py-6 sm:px-10 md:px-16 lg:px-24",
  items: [
    {
      icon: MapPin,
      title: "Well-Maintained Bikes",
      lines: ["Checked", "service records in every bike"],
    },
    {
      icon: Phone,
      title: "24/7 Support",
      lines: ["Help when you need it", "day or night"],
    },
    {
      icon: MapPin,
      title: "Pickup in Pokhara",
      lines: ["Collect at Amarsingh Chowk", "Pokhara"],
    },
  ],
};

export function HeroFeatureBar() {
  return (
    <div className={featureBar.className}>
      <div className="container flex flex-wrap items-center justify-between gap-4 md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {featureBar.items.map((item) => (
            <div key={item.title} className="flex items-center gap-2.5 text-sm font-medium text-brand-warm">
              <item.icon className="h-4 w-4 shrink-0 text-brand-gold" aria-hidden />
              <span className="max-w-[22ch] text-left leading-tight">{item.title}</span>
              <span className="ml-1 hidden text-brand-gold sm:inline">/</span>
              {item.lines.map((line) => (
                <span key={line} className="block text-[11px] text-brand-warm/60">{line}</span>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-brand-warm/55">
          <span>{shop.addressOneLine}</span>
          <span className="hidden sm:inline">·</span>
          {phoneLine && <span>{phoneLine}</span>}
        </div>
      </div>
    </div>
  );
}

export function DiscountTable() {
  const { data: pricing } = usePricing();
  const config = pricing ?? pricingConfig;
  const base = config.baseDailyRates.motorcycle ?? null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/15">
      <table className="w-full min-w-[460px] text-left text-sm">
        <caption className="sr-only">Long-term rental discounts</caption>
        <thead className="text-brand-warm/60"><tr><th className="p-4 font-medium">Rental length</th><th className="p-4 font-medium">Discount</th><th className="p-4 font-medium">Example at {base != null ? `${formatNpr(base, config)}/day` : "custom quotation"}</th></tr></thead>
        <tbody>
          {config.discountTiers.map((t, i, arr) => {
            const next = arr[i + 1];
            const label = next ? `${t.minDays}-${next.minDays - 1} days` : `${t.minDays}+ days`;
            const q = calculateQuote({ category: "motorcycle", baseDailyRate: base ?? undefined, offRoadEligible: false, tripType: "city", days: t.minDays }, config);
            return (
              <tr key={t.minDays} className="border-t border-white/10">
                <td className="p-4 font-heading font-semibold text-brand-warm">{label}</td>
                <td className="p-4">{t.percent}%</td>
                <td className="p-4">
                  {base == null ? "Custom quotation" : <>{t.minDays} days: <span className="text-brand-warm">{formatNpr(q.finalTotal, config)}</span>{q.savings > 0 && <span className="text-brand-gold"> (save {formatNpr(q.savings, config)})</span>}</>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LongTermOffers() {
  return (
    <section className="mt-24 bg-brand-charcoal py-20 text-brand-warm/80 md:mt-32 md:py-28">
      <div className="container grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-balance text-3xl font-extrabold text-brand-warm md:text-5xl">Stay longer, pay less per day</h2>
          <p className="mt-5 max-w-md text-lg">Weekly, two-week, three-week and monthly rentals get a lower price per day. Your estimate shows the original total, the discount and your savings.</p>
          <Button asChild variant="gold" size="lg" className="mt-8"><Link to="/booking">Request a long-term quote</Link></Button>
        </div>
        <DiscountTable />
      </div>
    </section>
  );
}

const reasonIcons = [MapPin, Wallet, Bike, CalendarCheck];

export function WhyChoose() {
  return (
    <section className="container pt-24 md:pt-32">
      <SectionHeading eyebrow="Why us" title="Why choose Nepal Bike Rental" />
      <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {reasons.map((r, i) => {
          const Icon = reasonIcons[i % reasonIcons.length];
          return (
            <StaggerItem key={r.title} className="h-full">
              <div className="group h-full rounded-2xl border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-charcoal text-brand-gold transition-colors group-hover:bg-brand-gold group-hover:text-brand-charcoal"><Icon className="h-6 w-6" aria-hidden /></span>
                <h3 className="mt-5 text-lg font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="container pt-24 md:pt-32">
      <SectionHeading eyebrow="Simple process" title="How renting works" text="From request to ride in five steps." />
      <Stagger className="grid gap-8 md:grid-cols-5 md:gap-6">
        {steps.map((s, i) => (
          <StaggerItem key={s.title} className="relative">
            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-charcoal font-heading text-lg font-extrabold text-brand-gold ring-4 ring-background">{i + 1}</span>
            {i < steps.length - 1 && <span aria-hidden className="absolute left-14 top-6 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-brand-gold/60 to-border md:block" />}
            <h3 className="mt-4 text-base font-bold">{s.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function Reviews() {
  const { data: reviews = [] } = usePublicReviews();
  const { average, count } = summarize(reviews);
  return (
    <section className="container pt-24 md:pt-32">
      {count === 0 ? (
        <div className="rounded-3xl bg-secondary p-8 text-center md:p-14">
          <h2 className="text-balance text-3xl font-extrabold md:text-4xl">Customer reviews</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">After you return your vehicle, the shop sends you a link to review your ride. Verified reviews from real renters appear here.</p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-balance text-3xl font-extrabold md:text-4xl">Customer reviews</h2>
              <p className="mt-3 flex items-center gap-2 text-muted-foreground"><Stars rating={average} /> <span className="font-semibold text-foreground">{average}</span> from {count} verified rental{count === 1 ? "" : "s"}</p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{reviews.slice(0, 6).map((r) => <ReviewCard key={r.id} review={r} />)}</div>
        </>
      )}
    </section>
  );
}

export function ShopVisit() {
  return (
    <section className="container pt-24 md:pt-32" id="visit">
      <div className="grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-2">
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-extrabold md:text-4xl">Visit our rental shop</h2>
          <ul className="mt-7 space-y-4 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-brand-golddeep" /><span><strong className="block font-heading">{shop.name}</strong>{shop.addressLines.join(", ")}</span></li>
            {phoneLine && <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-brand-golddeep" /><span>{phoneLine}</span></li>}
            {shop.openingHours && <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-brand-golddeep" /><span>{shop.openingHours}</span></li>}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{shop.collectionNotice}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild><a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer"><Navigation /> Get directions</a></Button>
            <WhatsAppButton message={buildInquiryMessage()} />
          </div>
        </div>
        <iframe title="Map search for Amarsingh Chowk, Pokhara" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-[320px] w-full border-0 lg:min-h-full" />
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="container max-w-3xl pt-24 md:pt-32">
      <SectionHeading title="Frequently asked questions" />
      <Accordion type="single" collapsible>
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`f${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

const trust = [
  { icon: HardHat, title: "Free rider helmet", text: "With every bike and scooty" },
  { icon: Route, title: "No kilometre limit", text: "Ride as far as your day takes you" },
  { icon: Wallet, title: "Pay the rest on return", text: "A small advance when you take it" },
  { icon: MapPin, title: "One shop in Pokhara", text: "Collect and return at Amarsingh Chowk" },
];

/** Overlaps the bottom of the hero. Only facts that are shop policy. */
export function TrustStrip() {
  return (
    <section className="container relative z-20 -mt-12 lg:-mt-16" aria-label="Why riders choose us">
      <ul className="grid gap-5 rounded-2xl border bg-card p-6 shadow-xl shadow-black/10 sm:grid-cols-2 lg:grid-cols-4 lg:p-7">
        {trust.map((t) => (
          <li key={t.title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-golddeep"><t.icon className="h-5 w-5" aria-hidden /></span>
            <span><strong className="block font-heading text-sm font-bold">{t.title}</strong><span className="text-xs text-muted-foreground">{t.text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="container pt-24 md:pt-32">
      <div className="relative overflow-hidden rounded-3xl bg-brand-charcoal px-6 py-14 text-center text-brand-warm md:px-16 md:py-20">
        <img src="/images/hero-adventure.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/60 to-brand-charcoal/80" aria-hidden />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Ready when you are</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-extrabold md:text-5xl">Your Pokhara ride starts at Amarsingh Chowk</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-warm/75">Choose a bike, pick your dates and send your request in a few minutes.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg"><Link to="/bikes">Choose your bike <ArrowRight aria-hidden /></Link></Button>
            <WhatsAppButton message={buildInquiryMessage()} label="Ask on WhatsApp" size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
