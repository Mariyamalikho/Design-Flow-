import React, { useState } from "react";
import { ImageIcon } from "lucide-react";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  wrapperClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = "",
  loading = "lazy",
  decoding = "async",
  className = "",
  wrapperClassName = "",
  fallback,
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError) {
    return (
      <div
        data-testid="optimized-image-error"
        className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 ${wrapperClassName || className}`}
      >
        {fallback || <ImageIcon className="w-8 h-8 opacity-40" />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!isLoaded && (
        <div
          data-testid="optimized-image-skeleton"
          className="absolute inset-0 bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"} ${className}`}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
