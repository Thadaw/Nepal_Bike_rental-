import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Props { message: string; label?: string; variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; className?: string }

export function WhatsAppButton({ message, label = "WhatsApp inquiry", variant = "whatsapp", size = "default", className }: Props) {
  const [note, setNote] = useState(false);
  const url = buildWhatsAppUrl(message);

  if (url) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <MessageCircle /> {label}
        </a>
      </Button>
    );
  }
  // No real number configured yet: never produce a production WhatsApp link.
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={async () => {
          try { await navigator.clipboard.writeText(message); } catch { /* clipboard unavailable */ }
          setNote(true);
        }}
      >
        <MessageCircle /> {label}
      </Button>
      {note && (
        <p role="status" className="max-w-xs text-xs text-muted-foreground">
          Demo mode: the shop WhatsApp number is not configured yet, so no chat was opened. Your inquiry message was copied instead.
        </p>
      )}
    </div>
  );
}
