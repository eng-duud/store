import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const MEDIA_FOLDERS = {
  PRODUCTS: "store/products",
  PRODUCT_GALLERY: "store/products/gallery",
  CATEGORIES: "store/categories",
  BRANDS: "store/brands",
  USERS: "store/users",
  CUSTOMERS: "store/customers",
  STORE_LOGO: "store/logo",
  STORE_BANNER: "store/banner",
  PROMOTIONS: "store/promotions",
  SYSTEM: "store/system",
} as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[keyof typeof MEDIA_FOLDERS];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_FILE_SIZE = 100; // 100 bytes

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
    rootFolder: process.env.CLOUDINARY_ROOT_FOLDER || "store",
    enableDelete: process.env.CLOUDINARY_ENABLE_DELETE !== "false",
    deleteOldOnReplace: process.env.CLOUDINARY_DELETE_OLD_ON_REPLACE !== "false",
    cleanupOrphans: process.env.CLOUDINARY_CLEANUP_ORPHANS === "true",
  };
}

export async function uploadToCloudinary(
  file: string | Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    format?: string;
    transformation?: object[];
    tags?: string[];
  }
): Promise<{
  publicId: string;
  secureUrl: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  version: number;
}> {
  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/jpeg;base64,${file.toString("base64")}`,
    {
      folder: options.folder,
      public_id: options.publicId,
      resource_type: options.resourceType || "image",
      format: options.format,
      transformation: options.transformation,
      tags: options.tags,
      unique_filename: true,
      overwrite: false,
    }
  );

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    url: result.url,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    version: result.version,
  };
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image"
): Promise<{ result: string }> {
  const config = getCloudinaryConfig();
  if (!config.enableDelete) {
    throw new Error("Cloudinary deletion is disabled via environment variable");
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  return { result: result.result };
}

export async function deleteMultipleFromCloudinary(
  publicIds: string[],
  resourceType: "image" | "video" | "raw" | "auto" = "image"
): Promise<{ deleted: number; errors: string[] }> {
  const config = getCloudinaryConfig();
  if (!config.enableDelete) {
    throw new Error("Cloudinary deletion is disabled via environment variable");
  }

  const errors: string[] = [];
  let deleted = 0;

  for (const publicId of publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      deleted++;
    } catch (error) {
      errors.push(`Failed to delete ${publicId}: ${error}`);
    }
  }

  return { deleted, errors };
}

export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | "auto";
    format?: "auto" | "webp" | "png" | "jpg" | "avif";
    crop?: "fill" | "fit" | "scale" | "thumb" | "limit";
    gravity?: "auto" | "center" | "face" | "faces";
    radius?: number;
    background?: string;
  } = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fit",
    gravity = "auto",
    radius,
    background,
  } = options;

  const parts: string[] = [];

  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (crop) parts.push(`c_${crop}`);
  if (gravity && (crop === "fill" || crop === "thumb")) parts.push(`g_${gravity}`);
  if (radius) parts.push(`r_${radius}`);
  if (background) parts.push(`b_${background}`);
  parts.push(`q_${quality}`);
  parts.push(`f_${format}`);

  return cloudinary.url(publicId, {
    transformation: parts.join(","),
    secure: true,
  });
}

export function getThumbnailUrl(publicId: string, size = 200): string {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

export function getResponsiveUrls(publicId: string): {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
} {
  return {
    xs: getOptimizedUrl(publicId, { width: 320, crop: "fit", format: "auto" }),
    sm: getOptimizedUrl(publicId, { width: 640, crop: "fit", format: "auto" }),
    md: getOptimizedUrl(publicId, { width: 768, crop: "fit", format: "auto" }),
    lg: getOptimizedUrl(publicId, { width: 1024, crop: "fit", format: "auto" }),
    xl: getOptimizedUrl(publicId, { width: 1920, crop: "fit", format: "auto" }),
  };
}

export async function listCloudinaryResources(
  folder: string,
  options: { maxResults?: number; nextCursor?: string } = {}
): Promise<{
  resources: Array<{
    publicId: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    createdAt: string;
  }>;
  nextCursor?: string;
  totalCount: number;
}> {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: folder + "/",
    max_results: options.maxResults || 50,
    next_cursor: options.nextCursor,
  });

  return {
    resources: result.resources.map((r: any) => ({
      publicId: r.public_id,
      secureUrl: r.secure_url,
      format: r.format,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      createdAt: r.created_at,
    })),
    nextCursor: result.next_cursor,
    totalCount: result.rate_limit_remaining || result.resources.length,
  };
}

export async function searchCloudinaryResources(
  query: string,
  options: { maxResults?: number; folder?: string } = {}
): Promise<{
  resources: Array<{
    publicId: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  }>;
  totalCount: number;
}> {
  const expression = options.folder
    ? `folder:${options.folder} AND ${query}`
    : query;

  const result = await cloudinary.search
    .expression(expression)
    .max_results(options.maxResults || 50)
    .execute();

  return {
    resources: result.resources.map((r: any) => ({
      publicId: r.public_id,
      secureUrl: r.secure_url,
      format: r.format,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
    })),
    totalCount: result.total_count,
  };
}

export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size ${Math.round(size / 1024 / 1024)}MB exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }
  if (size < MIN_FILE_SIZE) {
    return { valid: false, error: "File is too small" };
  }
  return { valid: true };
}

export function validateFileType(mimeType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not supported. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }
  return { valid: true };
}

export default cloudinary;
