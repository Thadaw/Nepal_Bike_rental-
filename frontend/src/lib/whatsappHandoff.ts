import { buildWhatsAppUrl } from "@/lib/whatsapp";

export type HandoffStatus = "opened" | "copied" | "unavailable";

/**
 * Opens WhatsApp with the message pre-filled. Must be called synchronously inside a click handler
 * so mobile browsers do not block the new tab. When no shop number is configured it copies the
 * message instead and never produces a fake chat link.
 */
export function openWhatsAppWithMessage(message: string): { status: HandoffStatus; url: string | null } {
  const url = buildWhatsAppUrl(message);
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return { status: "opened", url };
  }
  let copied = false;
  try {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(message);
      copied = true;
    }
  } catch {
    /* clipboard unavailable */
  }
  return { status: copied ? "copied" : "unavailable", url: null };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
