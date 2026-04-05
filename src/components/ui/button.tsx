import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "glass";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#00E5FF] text-[#0A1128] hover:bg-[#00E5FF]/90 shadow-[0_0_15px_rgba(0,229,255,0.3)]":
              variant === "default",
            "bg-[#FF3D00] text-white hover:bg-[#FF3D00]/90 shadow-[0_0_20px_rgba(255,61,0,0.4)]":
              variant === "destructive",
            "border border-[#2A3B5C] bg-transparent hover:bg-[#2A3B5C] text-white":
              variant === "outline",
            "bg-[#1A233A] text-white hover:bg-[#2A3B5C]":
              variant === "secondary",
            "hover:bg-[#1A233A] text-white": variant === "ghost",
            "text-[#00E5FF] underline-offset-4 hover:underline":
              variant === "link",
            "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20":
              variant === "glass",
            "h-12 px-6 py-2": size === "default",
            "h-9 rounded-xl px-3": size === "sm",
            "h-14 rounded-2xl px-8 text-base": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
