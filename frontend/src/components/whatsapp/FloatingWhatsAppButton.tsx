import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { buildInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export function FloatingWhatsAppButton() {
  const [note, setNote] = useState("");
  const { pathname } = useLocation();
  const message = buildInquiryMessage();
  const url = buildWhatsAppUrl(message);

  const handleClick = async () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(message);
      setNote(navigator.clipboard ? "WhatsApp number is not configured yet. Inquiry copied instead." : "WhatsApp number is not configured yet.");
    } catch {
      setNote("WhatsApp number is not configured yet.");
    }
  };

  // The booking page already offers WhatsApp, and the admin area does not need it.
  if (pathname.startsWith("/booking") || pathname.startsWith("/admin")) return null;

  return (
    <div className={`group fixed right-4 z-40 sm:right-6 sm:bottom-6 ${pathname.startsWith("/vehicles/") ? "bottom-24" : "bottom-4"}`}>
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-brand-charcoal px-3 py-1.5 text-xs font-medium text-brand-warm opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>
      <button
        type="button"
        onClick={handleClick}
        aria-label={url ? "Chat with Nepal Bike Rental on WhatsApp" : "WhatsApp unavailable: copy inquiry message"}
        title={url ? "Chat on WhatsApp" : "WhatsApp number not configured — click to copy inquiry"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform duration-200 hover:scale-105 hover:shadow-xl hover:shadow-black/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366] sm:h-16 sm:w-16"
      >
        <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
      </button>
      {note && (
        <p role="status" className="absolute bottom-full right-0 mb-3 w-56 rounded-lg bg-card p-3 text-xs text-muted-foreground shadow-lg">
          {note}
        </p>
      )}
    </div>
  );
}
