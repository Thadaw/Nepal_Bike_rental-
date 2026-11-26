import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

export function CategoryTiles() {
  const bikes = categories.find((c) => c.id === "motorcycle")!;
  const scooty = categories.find((c) => c.id === "scooty")!;
  const car = categories.find((c) => c.id === "car")!;
  return (
    <section className="container pt-20 md:pt-28" aria-labelledby="cat-h">
      <SectionHeading eyebrow="Our fleet" title="Pick your ride" text="Bikes and scooties, ready at one shop in Pokhara." />
      <h2 id="cat-h" className="sr-only">Rental categories</h2>
      <Stagger className="grid gap-5 md:grid-cols-5">
        {[{ c: bikes, span: "md:col-span-3", ratio: "aspect-[4/3] md:aspect-auto md:min-h-[460px]" }, { c: scooty, span: "md:col-span-2", ratio: "aspect-[4/3] md:aspect-auto md:min-h-[460px]" }].map(({ c, span, ratio }) => (
          <StaggerItem key={c.id} className={span}>
            <Link to={c.path} className={`group relative block h-full overflow-hidden rounded-3xl bg-brand-charcoal ${ratio}`}>
              {c.cutout ? (
                <>
                  {/* Real photo with a transparent background: sits on a soft glow so the whole vehicle stays visible. */}
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,#3a3f44_0%,#1b1e21_62%,#151719_100%)]" />
                  <div aria-hidden className="absolute inset-x-[12%] top-[58%] h-6 rounded-[100%] bg-black/60 blur-xl" />
                  <img src={c.image} alt={`${c.label} available to rent`} loading="lazy" decoding="async" className="absolute inset-x-0 top-[4%] h-[72%] w-full object-contain px-4 drop-shadow-[0_18px_24px_rgba(0,0,0,0.55)] transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1" />
                </>
              ) : (
                <img src={c.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-brand-warm">
                <div>
                  <h3 className="text-3xl font-extrabold md:text-4xl">{c.plural}</h3>
                  <p className="mt-2 max-w-[26ch] text-sm text-brand-warm/75">{c.blurb}</p>
                </div>
                <span className="rounded-full bg-brand-gold p-3 text-brand-charcoal transition-transform group-hover:rotate-45"><ArrowUpRight className="h-5 w-5" /></span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground"><strong className="font-heading text-foreground">Need a car or jeep?</strong> Available on request. Message us for a quote.</p>
        <Button asChild variant="outline" size="sm"><Link to={car.path}>See cars and jeeps</Link></Button>
      </div>
    </section>
  );
}
