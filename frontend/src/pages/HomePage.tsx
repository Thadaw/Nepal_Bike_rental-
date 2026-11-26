import { Hero } from "@/components/home/Hero";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturedVehicles } from "@/components/home/FeaturedVehicles";
import { FaqSection, FinalCta, HowItWorks, LongTermOffers, Reviews, ShopVisit, TrustStrip, WhyChoose } from "@/components/home/Sections";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function HomePage() {
  useDocumentMeta("Nepal Bike Rental", "Bike and scooty rental in Pokhara, Nepal. Free rider helmet, no kilometre limit. Book in minutes on the website or WhatsApp. Collect and return at Amarsingh Chowk.");
  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryTiles />
      <FeaturedVehicles />
      <LongTermOffers />
      <WhyChoose />
      <HowItWorks />
      <Reviews />
      <ShopVisit />
      <FaqSection />
      <FinalCta />
    </>
  );
}
