import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { reasons } from "@/data/content";
import { shop } from "@/config/shop";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function AboutPage() {
  useDocumentMeta("About", "Nepal Bike Rental is a single-shop vehicle rental in Amarsingh Chowk, Pokhara, Nepal.");
  return (
    <div className="container py-12 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold md:text-6xl">One shop. Many roads.</h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted-foreground">Nepal Bike Rental rents scooties, bikes and cars from a single shop at {shop.addressOneLine}. Customers collect and return vehicles in person, so every trip starts and ends with a conversation.</p>
          <Button asChild size="lg" className="mt-8"><Link to="/vehicles">Explore vehicles</Link></Button>
        </div>
        <ParallaxImage src="/images/pokhara-lakeside.svg" alt="Illustration of Pokhara lakeside" className="aspect-[4/3] rounded-3xl" />
      </div>
      <div className="mt-20 grid gap-8 md:grid-cols-2">
        {reasons.map((r) => <div key={r.title} className="border-t-2 border-brand-gold pt-5"><h2 className="text-xl font-bold">{r.title}</h2><p className="mt-2 text-muted-foreground">{r.text}</p></div>)}
      </div>
    </div>
  );
}
