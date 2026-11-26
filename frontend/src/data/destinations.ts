import type { Destination, VehicleCategory } from "@/types";

const ALL: VehicleCategory[] = ["scooty", "motorcycle", "car", "jeep"];

/**
 * Only destinations with `confirmed: true` are shown to customers (edit them in /admin).
 * `offRoad` marks routes where the off-road surcharge applies to eligible vehicles.
 */
export const destinations: Destination[] = [
  {
    slug: "mustang",
    name: "Mustang",
    tagline: "High desert canyons and long, quiet roads.",
    image: "/images/mustang-road.svg",
    gallery: [
      { src: "/images/mustang-road.svg", alt: "Illustration of a mountain road through the arid Mustang landscape" },
      { src: "/images/mountain-road-bike.svg", alt: "Illustration of a motorcycle on a mountain road at dusk" },
    ],
    description: "Mustang is known for dramatic dry valleys, wind-carved cliffs and a landscape unlike the green hills around Pokhara.",
    experience: "Expect long riding days, changing road surfaces and big skies. Plan fuel stops and weather margins with the shop before you leave.",
    eligibleCategories: ["motorcycle", "car", "jeep"],
    routeInfo: ["Typically starts from Pokhara and heads north along the Kali Gandaki valley.", "Road conditions vary by season. Ask the shop for current conditions before you leave.", "Some areas may need permits. Check the requirements before you travel."],
    offRoad: true,
    extraChargePerDay: 0,
    customQuoteOnly: false,
    confirmed: true,
  },
  {
    slug: "manang",
    name: "Manang",
    tagline: "Alpine valleys beneath the Annapurna range.",
    image: "/images/manang-valley.svg",
    gallery: [
      { src: "/images/manang-valley.svg", alt: "Illustration of a green alpine valley with snow peaks near Manang" },
      { src: "/images/mountain-road-bike.svg", alt: "Illustration of a motorcycle on a mountain road at dusk" },
    ],
    description: "Manang combines high-altitude villages, turquoise light and close views of snow peaks.",
    experience: "A trip for riders who enjoy mountain roads and slow, scenic days. Altitude and weather change quickly, so allow extra time.",
    eligibleCategories: ["motorcycle", "car", "jeep"],
    routeInfo: ["Typically reached by road via the Marsyangdi valley.", "Road conditions change with the season. Ask the shop before you leave.", "Carry spare time in your schedule for weather delays."],
    offRoad: true,
    extraChargePerDay: 0,
    customQuoteOnly: false,
    confirmed: true,
  },
  {
    slug: "muktinath",
    name: "Muktinath",
    tagline: "A pilgrimage destination in the high Himalaya.",
    image: "/images/muktinath-trail.svg",
    gallery: [
      { src: "/images/muktinath-trail.svg", alt: "Illustration of a trail with prayer flags near Muktinath" },
      { src: "/images/mustang-road.svg", alt: "Illustration of a road through dry mountain terrain" },
    ],
    description: "Muktinath is a sacred site for Hindus and Buddhists, set in a stark and beautiful high-mountain landscape.",
    experience: "A rewarding destination with prayer flags, thin air and wide views. Ride or drive with patience and check conditions before departure.",
    eligibleCategories: ALL,
    routeInfo: ["Typically reached via Jomsom along the Kali Gandaki valley.", "Road surfaces vary by season. Ask the shop for current conditions."],
    offRoad: true,
    extraChargePerDay: 0,
    customQuoteOnly: false,
    confirmed: true,
  },
  {
    slug: "pokhara",
    name: "Pokhara",
    tagline: "Lakeside roads and Himalayan views on your doorstep.",
    image: "/images/pokhara-lakeside.svg",
    gallery: [
      { src: "/images/pokhara-lakeside.svg", alt: "Illustration of Phewa-style lake with mountains behind" },
      { src: "/images/scooty-pokhara.svg", alt: "Illustration of a scooty on a Pokhara lakeside road" },
    ],
    description: "Pokhara is where every Nepal Bike Rental journey starts. Easy riding, lake views and mountain backdrops.",
    experience: "Ideal for city rentals. Explore the lakeside, viewpoints and nearby villages at your own pace.",
    eligibleCategories: ALL,
    routeInfo: ["City rental rates apply for riding in and around Pokhara.", "Collect and return at Amarsingh Chowk."],
    offRoad: false,
    extraChargePerDay: 0,
    customQuoteOnly: false,
    confirmed: true,
  },
];

/** Pseudo destination for trips not listed above. Always a custom quotation. */
export const customDestination: Destination = {
  slug: "other",
  name: "Other destination (custom quotation)",
  tagline: "Tell us where you want to go.",
  image: "/images/mountain-road-bike.svg",
  gallery: [],
  description: "Planning somewhere else? We will price it as a custom quotation.",
  experience: "",
  eligibleCategories: ALL,
  routeInfo: [],
  offRoad: false,
  extraChargePerDay: 0,
  customQuoteOnly: true,
  confirmed: false,
};

export const getDestination = (slug: string) => [...destinations, customDestination].find((d) => d.slug === slug);

/** Destinations customers can see and choose. */
export const confirmedDestinations = () => destinations.filter((d) => d.confirmed);
