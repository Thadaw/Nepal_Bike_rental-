import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-secondary text-secondary-foreground",
      gold: "bg-brand-gold/20 text-brand-golddeep",
      dark: "bg-brand-charcoal text-brand-warm",
      pending: "border border-dashed border-brand-golddeep/60 bg-brand-gold/10 text-brand-golddeep",
      glass: "bg-black/40 text-white backdrop-blur",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
