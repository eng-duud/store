"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type OptimizedImageProps = Omit<ImageProps, "onError"> & {
  fallbackClassName?: string;
};

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          fallbackClassName || className
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    );
  }

  const srcStr = typeof src === "string" ? src : (src as { src: string }).src;

  return (
    <NextImage
      src={src}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
      unoptimized={
        srcStr.includes("placehold.co") ||
        srcStr.includes("cloudinary.com") ||
        srcStr.startsWith("data:")
      }
      {...props}
    />
  );
}
