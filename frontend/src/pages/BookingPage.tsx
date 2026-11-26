import { BookingForm } from "@/components/booking/BookingForm";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function BookingPage() {
  useDocumentMeta("Book a bike", "Book a bike or scooty in Pokhara in four easy steps, on the website or on WhatsApp. Requests await shop confirmation.");
  return (
    <div className="container py-12 md:py-16">
      <h1 className="text-4xl font-extrabold md:text-6xl">Book your bike</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">Four quick steps. Send it on the website or on WhatsApp, whichever is easier.</p>
      <div className="mt-10"><BookingForm /></div>
    </div>
  );
}
