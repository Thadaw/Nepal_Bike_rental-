import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { mapDirectionsUrl, mapEmbedUrl, phoneLine, shop } from "@/config/shop";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function ContactPage() {
  useDocumentMeta("Contact", "Visit Nepal Bike Rental at Amarsingh Chowk, Pokhara, or send a WhatsApp inquiry.");
  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-4xl font-extrabold md:text-6xl">Contact and shop</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <ul className="space-y-5">
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-brand-golddeep" /><span><strong className="block font-heading">{shop.name}</strong>{shop.addressLines.join(", ")}</span></li>
            {phoneLine && <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-brand-golddeep" /><span>{phoneLine}</span></li>}
            {shop.openingHours && <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-brand-golddeep" /><span>{shop.openingHours}</span></li>}
          </ul>
          <p className="rounded-xl bg-secondary p-4 text-sm leading-relaxed">{shop.collectionNotice}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg"><a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer"><Navigation /> Get directions</a></Button>
            <WhatsAppButton message={buildInquiryMessage()} size="lg" />
          </div>
        </div>
        <iframe title="Map search for Amarsingh Chowk, Pokhara" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-[380px] w-full rounded-2xl border" />
      </div>
    </div>
  );
}
