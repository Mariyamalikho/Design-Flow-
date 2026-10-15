import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  valueDisplay?: string | React.ReactNode;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      valueDisplay,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5 w-full">
        {(label || valueDisplay) && (
          <div className="flex items-center justify-between text-xs">
            {label && (
              <label className="font-medium text-zinc-700 dark:text-zinc-300">
                {label}
              </label>
            )}
            {valueDisplay && (
              <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
                {valueDisplay}
              </span>
            )}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(
              "w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";
