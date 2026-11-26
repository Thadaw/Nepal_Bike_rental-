import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText, type HandoffStatus } from "@/lib/whatsappHandoff";
import { shop } from "@/config/shop";

interface Props {
  reference: string;
  message: string;
  url: string | null;
  status: HandoffStatus;
  onBack: () => void;
}

/** Shown after the WhatsApp chat is opened, so the customer knows the last step is pressing Send. */
export function WhatsAppHandoff({ reference, message, url, status, onBack }: Props) {
  const [copied, setCopied] = useState(false);
  const demo = status !== "opened";
  return (
    <div className="rounded-2xl border bg-card p-6 text-center sm:p-10" role="status">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#128c4a] text-white"><MessageCircle className="h-7 w-7" aria-hidden /></span>
      <h2 className="mt-5 text-2xl font-bold sm:text-3xl">{demo ? "Your booking message is ready" : "One last step: press Send in WhatsApp"}</h2>
      <p className="mt-2 text-muted-foreground">Reference <strong className="font-heading text-foreground">{reference}</strong></p>

      <ol className="mx-auto mt-6 max-w-md space-y-3 text-left text-sm">
        {[
          demo ? "The shop WhatsApp number is not set up yet, so we copied your message instead." : "WhatsApp opened with your booking details already typed in.",
          demo ? "Paste it into a chat with the shop once the number is available." : "Check the message, then press the green Send button.",
          "The shop replies to confirm availability and the final price.",
        ].map((t, i) => (
          <li key={t} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gold/25 text-xs font-bold text-brand-golddeep">{i + 1}</span>
            <span className="pt-0.5">{t}</span>
          </li>
        ))}
      </ol>

      <p className="mx-auto mt-6 max-w-md rounded-lg bg-brand-gold/15 p-4 text-sm">Not confirmed until the shop replies. {shop.collectionNotice}</p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {url && <Button asChild variant="whatsapp" size="lg"><a href={url} target="_blank" rel="noopener noreferrer"><MessageCircle /> Open WhatsApp again</a></Button>}
        <Button variant="outline" size="lg" onClick={async () => setCopied(await copyText(message))}>
          {copied ? <><Check /> Copied</> : <><Copy /> Copy message</>}
        </Button>
      </div>
      <div className="mt-4 flex justify-center gap-5 text-sm">
        <button type="button" onClick={onBack} className="underline underline-offset-4">Change my booking</button>
        <Link to="/" className="underline underline-offset-4">Back to home</Link>
      </div>
    </div>
  );
}
