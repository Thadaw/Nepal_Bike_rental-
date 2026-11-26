import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { vehicles } from "../../../frontend/src/data/vehicles";

const toJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

async function main() {
  console.log(`Found ${vehicles.length} vehicles to import.`);

  for (const vehicle of vehicles) {
    const data = {
      slug: vehicle.slug,
      name: vehicle.name,
      brand: vehicle.brand,
      modelYear: vehicle.modelYear,
      category: vehicle.category,
      tagline: vehicle.tagline,
      description: vehicle.description,
      keySpecs: toJson(vehicle.keySpecs),
      specs: toJson(vehicle.specs),
      images: toJson(vehicle.images),
      rentalTypes: toJson(vehicle.rentalTypes),
      offRoadEligible: vehicle.offRoadEligible,
      dailyRateOverride: vehicle.dailyRateOverride ?? null,
      destinations: toJson(vehicle.destinations),
      featured: vehicle.featured,
      badge: vehicle.badge ?? null,
      bookedRanges: toJson(vehicle.bookedRanges ?? []),
      isSample: vehicle.isSample,
    };

    await prisma.vehicle.upsert({
      where: { slug: vehicle.slug },
      create: data,
      update: data,
    });

    console.log(`Imported: ${vehicle.name} (${vehicle.slug})`);
  }

  const total = await prisma.vehicle.count();
  console.log(`\nImport complete. Total vehicles in database: ${total}`);
}

main()
  .catch((error) => {
    console.error("Vehicle import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });