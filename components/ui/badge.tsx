import * as React from "react"
import { classNames } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-blue-600 text-white",
    secondary: "border-transparent bg-gray-600 text-white",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "border-gray-300 text-gray-700 bg-transparent",
  }

  return (
    <div
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
