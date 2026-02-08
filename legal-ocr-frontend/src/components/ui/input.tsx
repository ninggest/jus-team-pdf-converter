import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-legal-300 bg-white px-3 py-2 text-sm",
                    "placeholder:text-legal-400",
                    "focus:outline-none focus:ring-2 focus:ring-legal-500 focus:ring-offset-0 focus:border-legal-500",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };
