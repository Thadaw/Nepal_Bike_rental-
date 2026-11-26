import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { useBookingStore } from "@/store/bookingStore";
import { addDaysISO, todayISO } from "@/lib/dates";
import { buildInquiryMessage } from "@/lib/whatsapp";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const dateInput = "mt-1 h-11 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-brand-warm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40 [color-scheme:dark]";

/** Pick dates first: they are remembered, so the booking form opens with them filled in. */
function DateBar() {
  const navigate = useNavigate();
  const { startDate, returnDate, update } = useBookingStore();
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(returnDate);
  const today = todayISO();
  const invalid = !!start && !!end && end <= start;

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    if (start && end) {
      update({ startDate: start, returnDate: end });
      navigate(`/bikes?from=${start}&to=${end}`);
    } else navigate("/bikes");
  };

  return (
    <form onSubmit={go} aria-label="Check your dates" className="mt-9 max-w-xl rounded-2xl border border-white/15 bg-brand-charcoal/55 p-4 backdrop-blur-md sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-xs font-medium text-brand-warm/70">Pickup date
          <input type="date" min={today} value={start} onChange={(e) => { setStart(e.target.value); if (end && end <= e.target.value) setEnd(""); }} className={dateInput} />
        </label>
        <label className="block text-xs font-medium text-brand-warm/70">Return date
          <input type="date" min={start ? addDaysISO(start, 1) : today} value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={invalid || undefined} className={dateInput} />
        </label>
        <Button type="submit" variant="gold" size="lg" className="h-11 w-full sm:w-auto" disabled={invalid}>See bikes <ArrowRight aria-hidden /></Button>
      </div>
      <p className="mt-3 text-xs text-brand-warm/55">Optional. We show only the bikes that are free on your dates.</p>
    </form>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section ref={ref} className="relative flex min-h-[680px] overflow-hidden bg-brand-charcoal pb-24 pt-12 text-brand-warm lg:min-h-[calc(100svh-4rem)] lg:pb-32">
      <motion.img
        src="/images/hero-adventure.webp"
        alt="Dirt bikes on an alpine ridge at sunset"
        initial={reduce ? false : { scale: 1.12, opacity: 0 }}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 1.6, ease }}
        style={reduce ? undefined : { y }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/85 via-40% to-brand-charcoal/0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(185,154,104,0.14),transparent_55%)]" />

      <div className="container relative z-10 flex items-center">
        <div className="max-w-2xl">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-charcoal/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold backdrop-blur">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> Pokhara · Amarsingh Chowk
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="text-balance text-5xl font-extrabold leading-[1.02] sm:text-6xl xl:text-7xl">
            <span className="text-brand-warm italic">Bike Rental</span>{" "}
            <span className="text-brand-gold italic">in Nepal</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.35 }}
            className="mt-6 max-w-lg text-lg text-brand-stone/85">
            Premium bikes and scooties from one friendly shop in Pokhara. Free rider helmet and no kilometre limit. Ride your way!
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.5 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="gold"><Link to="/bikes">Book now <ArrowRight aria-hidden /></Link></Button>
            <WhatsAppButton size="lg" message={buildInquiryMessage()} label="Book on WhatsApp" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.65 }}>
            <DateBar />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
