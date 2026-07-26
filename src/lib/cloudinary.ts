import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  file: string | Buffer,
  folder = "store"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/jpeg;base64,${file.toString("base64")}`,
    { folder, resource_type: "auto" }
  );
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export async function updateImage(
  publicId: string,
  file: string | Buffer,
  folder = "store"
): Promise<{ url: string; publicId: string }> {
  await deleteImage(publicId);
  return uploadImage(file, folder);
}

export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "png" | "jpg";
  } = {}
): string {
  const { width, height, quality = 80, format = "auto" } = options;
  if (!url.includes("cloudinary.com")) return url;

  const transformations: string[] = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`, `f_${format}`);

  return url.replace("/upload/", `/upload/${transformations.join(",")}/`);
}

export default cloudinary;
