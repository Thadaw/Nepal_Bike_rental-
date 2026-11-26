-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('scooty', 'motorcycle', 'car', 'jeep');

-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('city', 'adventure');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('new', 'confirmed', 'declined', 'completed');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('website', 'whatsapp');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partially_paid', 'paid');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'bank_transfer', 'qr', 'other');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "modelYear" INTEGER,
    "category" "VehicleCategory" NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keySpecs" JSONB NOT NULL,
    "specs" JSONB NOT NULL,
    "images" JSONB NOT NULL,
    "rentalTypes" JSONB NOT NULL,
    "offRoadEligible" BOOLEAN NOT NULL DEFAULT false,
    "dailyRateOverride" DOUBLE PRECISION,
    "destinations" JSONB NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "bookedRanges" JSONB,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "gallery" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "eligibleCategories" JSONB NOT NULL,
    "routeInfo" JSONB NOT NULL,
    "offRoad" BOOLEAN NOT NULL DEFAULT false,
    "extraChargePerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customQuoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "currencySymbol" TEXT NOT NULL DEFAULT 'रु.',
    "baseDailyRates" JSONB NOT NULL,
    "offRoadSurchargePerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountTiers" JSONB NOT NULL,
    "discountsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "durationPresets" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "source" "BookingSource" NOT NULL DEFAULT 'website',
    "pickupTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'new',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "vehicleSlug" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL,
    "tripType" "TripType" NOT NULL,
    "destination" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "days" INTEGER NOT NULL,
    "estimateStatus" TEXT NOT NULL,
    "estimateTotal" DECIMAL(12,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "reviewKeyHash" TEXT,
    "reviewKeyExpiresAt" TIMESTAMP(3),

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "provider" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "transactionReference" TEXT,
    "note" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vehicleSlug" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BookingRequest_reference_key" ON "BookingRequest"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_vehicleSlug_fkey" FOREIGN KEY ("vehicleSlug") REFERENCES "Vehicle"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "BookingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
