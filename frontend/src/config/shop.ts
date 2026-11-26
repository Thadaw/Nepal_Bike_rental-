/** Single source of truth for shop details. Contact numbers come from .env. */
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.trim() || "";
const shopPhone = (import.meta.env.VITE_SHOP_PHONE as string | undefined)?.trim() || whatsappNumber;

export const shop = {
  name: "Nepal Bike Rental",
  addressLines: ["Amarsingh Chowk", "Pokhara, Nepal"],
  addressOneLine: "Amarsingh Chowk, Pokhara, Nepal",
  /** Display phone number for the single rental shop. */
  phoneDisplay: shopPhone,
  /** Business WhatsApp number in international format, with country code 977. */
  whatsappNumber,
  /** Set real opening hours (e.g. "Daily 7:00 - 19:00") to show them on the site. null hides the line. */
  openingHours: null as string | null,
  collectionNotice:
    "Vehicle collection and return are available only at our rental shop in Amarsingh Chowk, Pokhara. Customers must visit the shop to collect and return their vehicles.",
  /** Full links (https://...) shown in the footer. null hides the icon. */
  social: { facebook: null as string | null, instagram: null as string | null },
  /** Added to the description of every bike and scooty. */
  helmetNote: "A rider helmet is provided free with every bike and scooty.",
  bookingStatusNotice:
    "A booking request is not a confirmed reservation. It awaits confirmation from Nepal Bike Rental.",
} as const;

const digits = shop.whatsappNumber.replace(/[\s()-]/g, "");
export const isWhatsAppConfigured = /^\+?\d{8,15}$/.test(digits);
export const whatsappDigits = digits.replace(/^\+/, "");

/** Phone number is shown only once a real number is configured. */
export const phoneLine: string | null = isWhatsAppConfigured ? shop.phoneDisplay : null;

const q = encodeURIComponent(shop.addressOneLine);
// Search by address only until the exact shop location is verified.
export const mapEmbedUrl = `https://www.google.com/maps?q=${q}&output=embed`;
export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
