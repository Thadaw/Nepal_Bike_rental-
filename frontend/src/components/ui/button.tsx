import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-heading text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-black/20",
        gold: "bg-brand-gold text-brand-charcoal hover:bg-[#c7aa7a] hover:shadow-lg hover:shadow-brand-gold/30",
        outline: "border border-foreground/25 bg-transparent hover:border-foreground hover:bg-foreground hover:text-background",
        ghost: "hover:bg-secondary",
        light: "bg-white/10 text-white backdrop-blur hover:bg-white hover:text-brand-charcoal border border-white/30",
        whatsapp: "bg-[#128c4a] text-white hover:bg-[#0f7a3f] hover:shadow-lg hover:shadow-[#128c4a]/30",
        link: "h-auto rounded-none p-0 underline-offset-4 hover:translate-y-0 hover:underline",
      },
      size: { default: "h-11 px-6", sm: "h-9 px-4", lg: "h-12 px-8 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
