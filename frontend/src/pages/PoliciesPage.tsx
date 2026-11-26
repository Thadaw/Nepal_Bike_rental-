import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { RulesByGroup } from "@/components/policies/Rules";
import { askShopTopics } from "@/data/content";
import { shop } from "@/config/shop";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function PoliciesPage() {
  useDocumentMeta("Rental policies", "ID, licence, payment, fuel, late returns and cancellation at Nepal Bike Rental in Pokhara.");
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <h1 className="text-4xl font-extrabold md:text-6xl">Before you rent</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">Our rental rules in plain words. Collection and return happen only at our shop in Amarsingh Chowk, Pokhara.</p>
      <div className="mt-10"><RulesByGroup /></div>
      <section className="mt-10 rounded-2xl bg-secondary p-6">
        <h2 className="text-xl font-bold">Not covered here</h2>
        <p className="mt-1 text-sm text-muted-foreground">Ask the shop about: {askShopTopics.join(", ").toLowerCase()}.</p>
      </section>
      <p className="mt-6 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">{shop.collectionNotice}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link to="/bikes">Choose a bike</Link></Button>
        <WhatsAppButton message={buildInquiryMessage()} label="Ask on WhatsApp" size="lg" variant="outline" />
      </div>
    </div>
  );
}
