export const faqs = [
  { q: "Where do I collect and return my vehicle?", a: "Only at our rental shop in Amarsingh Chowk, Pokhara. We do not deliver vehicles, and there is a single pick-up and return location." },
  { q: "Is an online booking request a confirmed reservation?", a: "No. A booking request is sent to Nepal Bike Rental and awaits confirmation. The shop confirms availability with you." },
  { q: "How is the rental price calculated?", a: "Daily rate multiplied by rental days. Longer rentals receive a discount. You see the full breakdown before you send a request." },
  { q: "Do you offer discounts for longer rentals?", a: "Yes. Rentals of 7, 14, 21 and 30 days or more get a lower price per day. The discount is shown in your estimate." },
  { q: "What do I need to rent, and how do I pay?", a: "A citizenship card or valid ID, and a valid driving licence (Nepali or international) for the vehicle you rent. You pay an advance when you take the vehicle and the rest when you return it. Insurance details: ask the shop." },
];

export const reasons = [
  { title: "One shop, no surprises", text: "Collect and return at Amarsingh Chowk. No delivery, no branch confusion." },
  { title: "Transparent pricing", text: "Daily rate times days, with any discount shown before you ask." },
  { title: "A ride for every plan", text: "From easy scooties to dirt bikes, pick the ride that fits your day." },
  { title: "Simple booking", text: "Book online in four steps, or send it on WhatsApp with your details already typed in." },
];

export const steps = [
  { title: "Choose your bike", text: "Browse bikes and scooties." },
  { title: "Book in 4 steps", text: "Pick your dates, then send on the website or on WhatsApp." },
  { title: "Wait for confirmation", text: "The shop confirms availability and final details." },
  { title: "Collect at the shop", text: "Visit Amarsingh Chowk, Pokhara to pick up your bike." },
  { title: "Ride and return", text: "Return the bike to the same shop." },
];

/** Topics the shop explains to each customer directly. No terms are invented here. */
/** Topics the shop has not published rules for yet. */
export const askShopTopics = ["Insurance", "Off-road restrictions", "Seasonal route restrictions"];

export type RuleId = "id" | "licence" | "helmet" | "payment" | "fuel" | "km" | "late" | "cancel" | "accident" | "breakdown";

/**
 * The shop's rental rules. `short` is the one-liner used on bike pages and the booking form;
 * `text` is the full wording for the policies page.
 */
export const rentalRules: { id: RuleId; group: string; title: string; short: string; text: string }[] = [
  { id: "id", group: "Before you ride", title: "ID required", short: "Citizenship card or valid ID", text: "Show your citizenship card or another valid identity card. We cannot hand over a vehicle without it." },
  { id: "licence", group: "Before you ride", title: "Valid driving licence", short: "Nepali or international licence for that vehicle", text: "You must hold a valid driving licence, Nepali or international, for the type of vehicle you rent. For example, a motorcycle licence to rent a motorcycle." },
  { id: "helmet", group: "Before you ride", title: "Rider helmet is free", short: "Rider helmet provided free", text: "A rider helmet is provided free with every bike and scooty." },
  { id: "payment", group: "Payment, fuel and returns", title: "Advance now, balance on return", short: "Advance when you take it, the rest on return", text: "An advance amount is paid when you take the vehicle, and the full remaining amount is paid when you return it. The shop tells you the advance amount." },
  { id: "fuel", group: "Payment, fuel and returns", title: "About 1 litre of fuel", short: "About 1 litre of fuel included", text: "The vehicle is handed over with about 1 litre of fuel." },
  { id: "km", group: "Payment, fuel and returns", title: "No kilometre limit", short: "No kilometre limit per day", text: "There is no kilometre limit per day." },
  { id: "late", group: "Payment, fuel and returns", title: "Late return", short: "Late fee per hour and per day", text: "Late returns are charged per hour, and per day for longer delays. If you will be late, call the shop as early as you can." },
  { id: "cancel", group: "Cancellation", title: "Cancelling a booking", short: "Valid reason with proof, or about 50% back", text: "To cancel, give a valid reason and show evidence, and your cancellation is accepted. Without a valid reason, only around 50% of what you paid is returned." },
  { id: "accident", group: "If something goes wrong", title: "Accidents", short: "Customer is responsible for accidents", text: "If an accident happens while the vehicle is with you, the customer is responsible." },
  { id: "breakdown", group: "If something goes wrong", title: "Breakdowns and damage", short: "Breakdowns: the shop decides case by case", text: "If the bike breaks down or gets damaged, we will look at the situation and decide according to what happened. Please call the shop as soon as it happens." },
];

/** Shown on the booking page so customers arrive with the right documents. */
export const whatToBring = [
  { title: "Citizenship card or passport", text: "Any valid ID. Required: we cannot hand over a vehicle without it." },
  { title: "Valid driving licence", text: "Nepali or international, for the type of vehicle you rent." },
  { title: "Your booking reference", text: "The TR- code from your confirmation or WhatsApp message." },
  { title: "A phone we can reach", text: "WhatsApp is best, so the shop can confirm and contact you on the road." },
] as const;
