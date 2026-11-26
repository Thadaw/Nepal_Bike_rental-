import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIssueReviewKey } from "@/features/bookings/hooks";
import { useAdminReviews } from "@/features/reviews/hooks";
import type { AdminBookingRequest } from "@/features/bookings/types";
import { buildReviewLink, buildReviewRequestMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { toWhatsAppDigits } from "@/lib/phone";
import { formatDate } from "@/lib/dates";

/**
 * Completed bookings only. Creates the customer's secret review link and opens WhatsApp to their
 * number with the message already typed. Only customers the shop sends a link to can review.
 */
export function ReviewLinkButton({ booking, vehicleName }: { booking: AdminBookingRequest; vehicleName: string }) {
  const issue = useIssueReviewKey();
  const { data: reviews = [] } = useAdminReviews();
  const [note, setNote] = useState("");
  if (booking.status !== "completed") return null;
  if (reviews.some((r) => r.reference === booking.id)) return <p className="text-xs font-semibold text-emerald-700">Reviewed</p>;

  const makeLink = async () => {
    const { key } = await issue.mutateAsync(booking.id);
    const link = buildReviewLink(window.location.origin, booking.id, key);
    return { link, message: buildReviewRequestMessage({ customerName: booking.name, vehicleName, link }) };
  };

  const sendWhatsApp = async () => {
    setNote("");
    // Open the tab inside the click, before the async work, so the browser does not block it.
    const tab = window.open("", "_blank");
    try {
      const { link, message } = await makeLink();
      const url = buildWhatsAppUrl(message, toWhatsAppDigits(booking.phone));
      if (url && tab) { tab.location.href = url; return; }
      tab?.close();
      await navigator.clipboard?.writeText(link);
      setNote("Could not open WhatsApp. The link was copied instead.");
    } catch (e) {
      tab?.close();
      setNote(e instanceof Error ? e.message : "Could not create the link.");
    }
  };

  const copy = async () => {
    setNote("");
    try {
      const { link } = await makeLink();
      await navigator.clipboard.writeText(link);
      setNote("Review link copied.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Could not copy the link.");
    }
  };

  return (
    <div className="space-y-1.5">
      <Button type="button" size="sm" variant="whatsapp" disabled={issue.isPending} onClick={() => void sendWhatsApp()}>
        <MessageCircle aria-hidden /> {booking.reviewLinkSentAt ? "Resend review link" : "Send review link"}
      </Button>
      <Button type="button" size="sm" variant="ghost" className="w-full" disabled={issue.isPending} onClick={() => void copy()}><Link2 aria-hidden /> Copy link</Button>
      {booking.reviewLinkSentAt && <p className="text-[11px] text-muted-foreground">Sent {formatDate(booking.reviewLinkSentAt.slice(0, 10))}</p>}
      {note && <p role="status" className="text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}
