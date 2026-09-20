import * as React from "react"
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize"
import { cn } from "@/lib/utils"

export interface TextareaProps extends TextareaAutosizeProps {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-indigo-400 transition-colors resize-none",
          error && "border-red-500 focus-visible:ring-red-500 dark:border-red-900 dark:focus-visible:ring-red-900",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
