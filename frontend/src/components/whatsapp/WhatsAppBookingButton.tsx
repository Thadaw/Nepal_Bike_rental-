import { useId, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildBookingMessage } from "@/lib/whatsapp";
import { openWhatsAppWithMessage } from "@/lib/whatsappHandoff";
import { makeReference } from "@/lib/dates";
import { useCreateBookingRequest } from "@/features/bookings/hooks";
import { whatsappBookingSchema } from "@/lib/schemas";
import type { Quote } from "@/lib/pricing";
import type { TripType } from "@/types";
import { cn } from "@/lib/utils";

interface CustomerDetails {
  name: string;
  phone: string;
  message?: string;
}

interface Props {
  vehicleName: string;
  /** When given, the request is also saved so the shop sees it in the admin list. */
  vehicleSlug?: string;
  category: string;
  startDate: string;
  returnDate: string;
  tripType: TripType;
  days?: number;
  destinationName?: string;
  quote?: Quote;
  customer?: CustomerDetails;
  disabled?: boolean;
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
}

export function WhatsAppBookingButton({
  vehicleName,
  vehicleSlug,
  category,
  startDate,
  returnDate,
  tripType,
  days,
  destinationName = "",
  quote,
  customer,
  disabled = false,
  size = "lg",
  className,
  label = "Book via WhatsApp",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const [inline, setInline] = useState({ name: "", phone: "", message: "" });
  const [attempted, setAttempted] = useState(false);
  const [note, setNote] = useState("");

  const values = customer ?? inline;
  const parsed = whatsappBookingSchema.safeParse({
    name: values.name,
    phone: values.phone,
    vehicleName,
    startDate,
    returnDate,
    tripType,
    destinationName,
  });

  const issues = attempted && !parsed.success ? parsed.error.issues : [];
  const errorFor = (field: "name" | "phone") => issues.find((i) => i.path[0] === field)?.message;
  const generalMessages = Array.from(new Set(issues.filter((i) => customer || (i.path[0] !== "name" && i.path[0] !== "phone")).map((i) => i.message)));

  const createBooking = useCreateBookingRequest();

  const handleClick = () => {
    setAttempted(true);
    if (disabled || !parsed.success) return;

    const reference = makeReference();
    const message = buildBookingMessage({
      vehicleName,
      category,
      customerName: values.name.trim(),
      phone: values.phone.trim(),
      startDate,
      returnDate,
      tripType,
      days,
      destinationName,
      extraMessage: values.message,
      quote,
      reference,
    });
    // Open synchronously so mobile browsers do not block the chat.
    const { status } = openWhatsAppWithMessage(message);

    if (vehicleSlug) {
      createBooking.mutate({
        reference,
        source: "whatsapp",
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: "",
        vehicleSlug,
        startDate,
        returnDate,
        tripType,
        destination: "",
        message: values.message ?? "",
        days: quote?.days ?? days ?? 0,
        estimateStatus: quote?.status ?? "incomplete",
        estimateTotal: quote?.finalTotal ?? 0,
      });
    }

    if (status === "opened") setNote(`WhatsApp opened (ref ${reference}). Check the message and press Send to finish.`);
    else setNote(status === "copied" ? "The shop WhatsApp number is not set up yet, so your message was copied instead." : "The shop WhatsApp number is not set up yet.");
  };

  return (
    <div className={cn("space-y-3", className)}>
      {!customer && (
        <div className="space-y-3 rounded-xl border bg-card/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${uid}-name`}>Full name</Label>
              <Input
                id={`${uid}-name`}
                autoComplete="name"
                placeholder="Your full name"
                value={values.name}
                onChange={(e) => setInline((v) => ({ ...v, name: e.target.value }))}
                aria-invalid={!!errorFor("name") || undefined}
                aria-describedby={errorFor("name") ? `${uid}-name-error` : undefined}
              />
              {errorFor("name") && <p id={`${uid}-name-error`} role="alert" className="text-xs text-destructive">{errorFor("name")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${uid}-phone`}>Phone</Label>
              <Input
                id={`${uid}-phone`}
                type="tel"
                autoComplete="tel"
                placeholder="+977 98XXXXXXXX"
                value={values.phone}
                onChange={(e) => setInline((v) => ({ ...v, phone: e.target.value }))}
                aria-invalid={!!errorFor("phone") || undefined}
                aria-describedby={errorFor("phone") ? `${uid}-phone-error` : undefined}
              />
              {errorFor("phone") && <p id={`${uid}-phone-error`} role="alert" className="text-xs text-destructive">{errorFor("phone")}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${uid}-message`}>Additional message (optional)</Label>
            <Textarea
              id={`${uid}-message`}
              rows={2}
              placeholder="Pick-up time, riding experience, questions..."
              value={values.message ?? ""}
              onChange={(e) => setInline((v) => ({ ...v, message: e.target.value }))}
            />
          </div>
        </div>
      )}

      {generalMessages.length > 0 && (
        <ul id={`${uid}-errors`} role="alert" className="space-y-1 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          {generalMessages.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}

      <Button
        type="button"
        variant="whatsapp"
        size={size}
        onClick={handleClick}
        disabled={disabled}
                aria-describedby={generalMessages.length ? `${uid}-errors` : undefined}
        className="w-full"
      >
        <MessageCircle aria-hidden="true" /> {label}
      </Button>

      {note && <p role="status" className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
