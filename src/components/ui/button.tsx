import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 focus-visible:ring-emerald-500",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500",
        outline: "border-2 border-emerald-200 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 focus-visible:ring-emerald-500",
        secondary: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-sm hover:from-slate-200 hover:to-slate-300 focus-visible:ring-slate-500",
        ghost: "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-500",
        link: "text-emerald-600 underline-offset-4 hover:underline focus-visible:ring-emerald-500",
        premium: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 focus-visible:ring-amber-500"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-12 w-12",
        wide: "h-12 px-12 py-3 min-w-[200px]"
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
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }