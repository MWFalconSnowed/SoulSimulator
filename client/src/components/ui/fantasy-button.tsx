import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";

interface FantasyButtonProps extends ButtonProps {
  variant?: "gold" | "copper" | "mystical" | "emerald" | "crimson" | "default";
  glowing?: boolean;
}

export function FantasyButton({ 
  className, 
  variant = "default", 
  glowing = false, 
  children, 
  ...props 
}: FantasyButtonProps) {
  const variantStyles = {
    gold: "bg-yellow-600 hover:bg-yellow-500 text-black border-yellow-400",
    copper: "bg-orange-700 hover:bg-orange-600 text-white border-orange-500",
    mystical: "bg-purple-900 hover:bg-purple-800 text-white border-purple-600",
    emerald: "bg-green-800 hover:bg-green-700 text-white border-green-600",
    crimson: "bg-red-900 hover:bg-red-800 text-white border-red-600",
    default: "glass-panel hover:bg-gray-800 text-white border-yellow-600/30"
  };

  return (
    <Button
      className={cn(
        "medieval-border transition-all duration-300 font-medium",
        variantStyles[variant],
        glowing && "entity-glow",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
