"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type OptimizedImageProps = Omit<ImageProps, "onError"> & {
  fallbackClassName?: string;
  mediaId?: string;
  alt?: string;
};

function getCloudinaryOptimizedUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!url.includes("cloudinary.com")) return url;

  const parts: string[] = [];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  parts.push("q_auto", "f_auto");

  return url.replace("/upload/", `/upload/${parts.join(",")}/`);
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  width,
  height,
  mediaId,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = useMemo(() => {
    const srcStr = typeof src === "string" ? src : (src as { src: string })?.src || "";
    if (!srcStr) return srcStr;

    if (srcStr.includes("cloudinary.com")) {
      return getCloudinaryOptimizedUrl(
        srcStr,
        typeof width === "number" ? width : undefined,
        typeof height === "number" ? height : undefined
      );
    }

    return srcStr;
  }, [src, width, height]);

  if (hasError || !optimizedSrc) {
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

  const srcStr = typeof optimizedSrc === "string" ? optimizedSrc : String(optimizedSrc);

  return (
    <NextImage
      src={optimizedSrc}
      alt={alt || ""}
      className={cn("object-cover", className)}
      width={width}
      height={height}
      loading={props.loading || "lazy"}
      onError={() => setHasError(true)}
      unoptimized={
        srcStr.includes("placehold.co") ||
        srcStr.startsWith("data:")
      }
      {...props}
    />
  );
}

export default OptimizedImage;
