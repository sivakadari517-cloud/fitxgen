"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
  }
>(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-slate-200",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
      style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }