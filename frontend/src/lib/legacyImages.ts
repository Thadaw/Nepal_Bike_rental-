/** Old PNG paths (saved in a browser by an earlier version) mapped to the optimised WebP files. */
const legacy: Record<string, string> = {
  "/images/Aprilia SR Sport Scooter Cutout.png": "/images/aprilia-sr-sport-scooty.webp",
  "/images/Aprilia%20SR%20Sport%20Scooter%20Cutout.png": "/images/aprilia-sr-sport-scooty.webp",
  "/images/Blue Crossfire 300 Dirt Bike.png": "/images/blue-crossfire-300-dirt-bike.webp",
  "/images/Blue%20Crossfire%20300%20Dirt%20Bike.png": "/images/blue-crossfire-300-dirt-bike.webp",
  "/images/Crossfire RM 250 Dirt Bike.png": "/images/crossfire-rm-250-dirt-bike.webp",
  "/images/Crossfire%20RM%20250%20Dirt%20Bike.png": "/images/crossfire-rm-250-dirt-bike.webp",
  "/images/Hero XPulse Adventure Motorcycle.png": "/images/hero-xpulse-adventure-motorcycle.webp",
  "/images/Hero%20XPulse%20Adventure%20Motorcycle.png": "/images/hero-xpulse-adventure-motorcycle.webp",
  "/images/KTM Duke 200 Side Profile Cutout.png": "/images/ktm-duke-200.webp",
  "/images/KTM%20Duke%20200%20Side%20Profile%20Cutout.png": "/images/ktm-duke-200.webp",
  "/images/KTM Duke 250 Studio Cutout.png": "/images/ktm-duke-250.webp",
  "/images/KTM%20Duke%20250%20Studio%20Cutout.png": "/images/ktm-duke-250.webp",
  "/images/Modern Green Triumph Scrambler Motorcycle.png": "/images/triumph-scrambler.webp",
  "/images/Modern%20Green%20Triumph%20Scrambler%20Motorcycle.png": "/images/triumph-scrambler.webp",
  "/images/Royal Enfield  Bullet 350 Cutout.png": "/images/royal-enfield-bullet-350.webp",
  "/images/Royal%20Enfield%20%20Bullet%20350%20Cutout.png": "/images/royal-enfield-bullet-350.webp",
  "/images/honda dio scooter .png": "/images/honda-dio-scooty.webp",
  "/images/honda%20dio%20scooter%20.png": "/images/honda-dio-scooty.webp",
  "/images/hero-advanture.png": "/images/hero-adventure.webp",
  "/images/hero-advanture1.png": "/images/hero-adventure-2.webp"
};

export function modernImageSrc(src: string): string {
  return legacy[src] ?? legacy[decodeURI(src)] ?? src;
}
