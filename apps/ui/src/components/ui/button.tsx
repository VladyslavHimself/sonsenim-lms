import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner.tsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-brand-strong",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-surface-muted hover:bg-surface-muted-hover hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-14 rounded-lg px-0",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  async?: boolean,
  asyncStatus?: 'idle' | 'pending' | 'success' | 'error',
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, async, asyncStatus, ...props }, ref) => {

    // TODO: Replace if another conditions need to be implemented
    const approximatedCondition = asyncStatus === 'pending' ? 'loading' : 'idle';
    const ChildrenComp = approximatedCondition === "loading" ? <Spinner /> : props.children

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        disabled={approximatedCondition === 'loading'}
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ cursor: async && approximatedCondition === 'loading' ? 'wait' : 'pointer' }}
        ref={ref}
        {...props}
        children={ChildrenComp}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
