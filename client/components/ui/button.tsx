import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      default: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
      outline: "border border-zinc-300 hover:bg-zinc-100 text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-100",
      ghost: "hover:bg-zinc-100 text-zinc-900 dark:hover:bg-zinc-900 dark:text-zinc-100",
    } as const;
    const sizes = {
      sm: "h-8 rounded-md px-3 text-sm",
      md: "h-10 rounded-md px-4 text-sm",
      lg: "h-12 rounded-lg px-5 text-base",
    } as const;
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
    );
  }
);
Button.displayName = "Button";
