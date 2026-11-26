import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function NotFoundPage() {
  useDocumentMeta("Page not found");
  return (
    <div className="container py-28 text-center">
      <h1 className="text-5xl font-extrabold">This road does not lead anywhere</h1>
      <p className="mt-4 text-muted-foreground">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex justify-center gap-3"><Button asChild><Link to="/">Back to home</Link></Button><Button asChild variant="outline"><Link to="/vehicles">Browse vehicles</Link></Button></div>
    </div>
  );
}
