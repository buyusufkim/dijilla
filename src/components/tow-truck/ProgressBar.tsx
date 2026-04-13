import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  return (
    <div className="flex items-center gap-2 px-1">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div 
          key={s}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-500",
            s <= step ? "bg-[#00E5FF]" : "bg-white/10"
          )}
        />
      ))}
    </div>
  );
};
