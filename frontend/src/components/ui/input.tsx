import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn("flex h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive", className)}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("flex h-11 w-full rounded-lg border border-input bg-card px-3 pr-8 text-sm disabled:opacity-50 aria-[invalid=true]:border-destructive", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
