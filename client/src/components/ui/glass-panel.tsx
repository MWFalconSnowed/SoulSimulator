import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export function GlassPanel({ 
  className, 
  border = true, 
  children, 
  ...props 
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-lg",
        border && "medieval-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
