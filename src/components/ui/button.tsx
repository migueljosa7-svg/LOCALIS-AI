import { type VariantProps, cva } from "class-variance-authority";
import { type ElementType, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-ring rounded-xl text-sm py-3 px-5 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white shadow-neon-glow-x",
        ghost: "glass text-foreground border border-glass-border hover:border-cyan-500/30",
        outline: "glass text-foreground border border-border hover:border-cyan-500/50",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        white: "bg-white/10 text-white border border-white/10 hover:bg-white/15",
      },
      size: {
        default: "py-3 px-5",
        sm: "py-2 px-4 text-xs",
        lg: "py-4 px-6 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "button" : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants, Button };
