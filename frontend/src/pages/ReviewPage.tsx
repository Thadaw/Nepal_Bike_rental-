import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, LinkIcon } from "lucide-react";
import { ApiError } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarInput } from "@/components/reviews/Stars";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { useReviewLink, useSubmitReview } from "@/features/reviews/hooks";
import { reviewSchema } from "@/features/reviews/schemas";
import { buildInquiryMessage } from "@/lib/whatsapp";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

function Notice({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center sm:p-10" role="status">
      <LinkIcon className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <h2 className="mt-4 text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

export default function ReviewPage() {
  useDocumentMeta("Review your rental", "Share how your rental went.");
  // Private page: keep it out of search engines.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex,nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  const [params] = useSearchParams();
  const reference = params.get("ref") ?? "";
  const key = params.get("key") ?? "";
  const link = useReviewLink(reference, key);
  const submit = useSubmitReview();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ name?: string; rating?: string; comment?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  const linkInfo = link.data;
  useEffect(() => { if (linkInfo) setName((n) => n || linkInfo.customerName); }, [linkInfo]);

  const ask = <WhatsAppButton message={buildInquiryMessage()} label="Message the shop" />;
  const home = <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>;

  let body: React.ReactNode;
  if (done) {
    body = (
      <div className="rounded-2xl border bg-card p-8 text-center sm:p-10" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-3xl font-bold">Thank you!</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">Your review was sent. It will appear on the website once the shop has checked it.</p>
        <div className="mt-6 flex justify-center">{home}</div>
      </div>
    );
  } else if (!reference || !key) {
    body = <Notice title="This review link is incomplete" text="Please open the full link the shop sent you on WhatsApp, or ask the shop to send it again.">{ask}{home}</Notice>;
  } else if (link.isLoading) {
    body = <div className="min-h-[30vh]" aria-busy="true" />;
  } else if (link.error) {
    const status = link.error instanceof ApiError ? link.error.status : 0;
    body = status === 409
      ? <Notice title="You have already reviewed this rental" text="Thank you, we have your review. There is one review per rental.">{home}</Notice>
      : <Notice title="This review link is not valid" text="The link may be wrong, or the rental is not marked as returned yet. Ask the shop to send you a new link.">{ask}{home}</Notice>;
  } else if (link.data) {
    const info = link.data;
    const onSubmit = () => {
      setSubmitError("");
      const parsed = reviewSchema.safeParse({ name, rating: rating || undefined, comment });
      if (!parsed.success) {
        const e: typeof errors = {};
        for (const i of parsed.error.issues) { const k = i.path[0] as keyof typeof errors; if (!e[k]) e[k] = i.message; }
        setErrors(e);
        return;
      }
      setErrors({});
      submit.mutate({ reference, key, ...parsed.data }, {
        onSuccess: () => setDone(true),
        onError: (err) => setSubmitError(err instanceof ApiError && err.status === 409 ? "This rental has already been reviewed." : err instanceof Error ? err.message : "Something went wrong. Please try again."),
      });
    };
    body = (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} noValidate className="space-y-6 rounded-2xl border bg-card p-5 sm:p-8" aria-label="Review form">
        <div>
          <p className="text-sm text-muted-foreground">Your rental</p>
          <p className="font-heading text-xl font-bold">{info.vehicleName}</p>
          <p className="text-xs text-muted-foreground">Reference {info.reference}</p>
        </div>
        <div className="space-y-1.5">
          <Label>How was it?</Label>
          <StarInput value={rating} onChange={setRating} />
          {errors.rating && <p role="alert" className="text-xs text-destructive">{errors.rating}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rv-name">Your name <span className="font-normal text-muted-foreground">(shown with your review)</span></Label>
          <Input id="rv-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} />
          {errors.name && <p role="alert" className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rv-comment">Your review</Label>
          <Textarea id="rv-comment" rows={5} placeholder="The bike, the shop, the ride... what should other riders know?" value={comment} onChange={(e) => setComment(e.target.value)} aria-invalid={errors.comment ? true : undefined} />
          <div className="flex justify-between text-xs"><span role={errors.comment ? "alert" : undefined} className="text-destructive">{errors.comment}</span><span className="text-muted-foreground">{comment.length}/600</span></div>
        </div>
        {submitError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={submit.isPending}>
          {submit.isPending ? <><Loader2 className="animate-spin" /> Sending</> : "Send review"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Reviews are checked by the shop before they appear on the website.</p>
      </form>
    );
  }

  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <h1 className="text-4xl font-extrabold md:text-5xl">Review your rental</h1>
      <p className="mt-3 text-lg text-muted-foreground">Thanks for riding with Nepal Bike Rental. It takes a minute.</p>
      <div className="mt-8">{body}</div>
    </div>
  );
}
