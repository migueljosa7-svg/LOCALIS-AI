import { type VariantProps, cva } from "class-variance-authority";
import { type ElementType, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-2xl border border-border bg-card text-foreground shadow-lg", {
  variants: {
    variant: {
      default: "",
      glass: "bg-transparent border-transparent -m-2",
      elevated: "bg-card shadow-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
);
Card.displayName = "Card";

export { cardVariants, Card };
