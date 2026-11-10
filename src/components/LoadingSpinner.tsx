export function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-[1.5px]",
    md: "w-6 h-6 border-2",
    lg: "w-9 h-9 border-2",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
