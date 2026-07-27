import { prisma } from "@/lib/prisma";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedUrl,
  getThumbnailUrl,
  getResponsiveUrls,
  MEDIA_FOLDERS,
  type MediaFolder,
  validateFileSize,
  validateFileType,
  listCloudinaryResources,
} from "@/lib/cloudinary";

export interface MediaUploadResult {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  folder: string;
  mimeType: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  version: number | null;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface MediaUploadInput {
  file: string | Buffer;
  entityType: string;
  entityId?: string;
  folder?: MediaFolder;
  altText?: string;
  fileName?: string;
  mimeType?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  tags?: string[];
  uploadedBy?: string;
}

export interface MediaReplaceInput {
  mediaId: string;
  file: string | Buffer;
  altText?: string;
  mimeType?: string;
}

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

class MediaService {
  async upload(input: MediaUploadInput): Promise<MediaUploadResult> {
    const folder = input.folder || MEDIA_FOLDERS.SYSTEM;

    if (input.mimeType) {
      const typeValidation = validateFileType(input.mimeType);
      if (!typeValidation.valid) {
        throw new Error(typeValidation.error);
      }
    }

    const uploaded = await uploadToCloudinary(input.file, {
      folder,
      resourceType: "image",
      tags: input.tags,
    });

    const media = await prisma.media.create({
      data: {
        publicId: uploaded.publicId,
        url: uploaded.url,
        secureUrl: uploaded.secureUrl,
        folder,
        entityType: input.entityType,
        entityId: input.entityId || null,
        altText: input.altText || null,
        fileName: input.fileName || null,
        mimeType: input.mimeType || null,
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
        version: uploaded.version,
        isPrimary: input.isPrimary || false,
        sortOrder: input.sortOrder || 0,
        tags: input.tags?.join(",") || null,
        uploadedBy: input.uploadedBy || null,
      },
    });

    return {
      id: media.id,
      publicId: media.publicId,
      url: media.url,
      secureUrl: media.secureUrl,
      folder: media.folder,
      mimeType: media.mimeType,
      format: media.format,
      width: media.width,
      height: media.height,
      bytes: media.bytes,
      version: media.version,
      altText: media.altText,
      isPrimary: media.isPrimary,
      sortOrder: media.sortOrder,
      createdAt: media.createdAt,
    };
  }

  async uploadMultiple(
    inputs: MediaUploadInput[]
  ): Promise<MediaUploadResult[]> {
    const results: MediaUploadResult[] = [];
    for (const input of inputs) {
      const result = await this.upload(input);
      results.push(result);
    }
    return results;
  }

  async replace(input: MediaReplaceInput): Promise<MediaUploadResult> {
    const existingMedia = await prisma.media.findUnique({
      where: { id: input.mediaId },
    });

    if (!existingMedia) {
      throw new Error("Media not found");
    }

    if (input.mimeType) {
      const typeValidation = validateFileType(input.mimeType);
      if (!typeValidation.valid) {
        throw new Error(typeValidation.error);
      }
    }

    const uploaded = await uploadToCloudinary(input.file, {
      folder: existingMedia.folder,
      resourceType: "image",
    });

    const media = await prisma.media.update({
      where: { id: input.mediaId },
      data: {
        publicId: uploaded.publicId,
        url: uploaded.url,
        secureUrl: uploaded.secureUrl,
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
        version: uploaded.version,
        altText: input.altText || existingMedia.altText,
        mimeType: input.mimeType || existingMedia.mimeType,
      },
    });

    const config = await this.getConfig();
    if (config.deleteOldOnReplace && existingMedia.publicId !== uploaded.publicId) {
      try {
        await deleteFromCloudinary(existingMedia.publicId);
      } catch (error) {
        console.error("Failed to delete old media from Cloudinary:", error);
      }
    }

    await this.updateProductImageReferences(
      media.entityType,
      media.entityId,
      existingMedia.publicId,
      media.publicId,
      media.url
    );

    return {
      id: media.id,
      publicId: media.publicId,
      url: media.url,
      secureUrl: media.secureUrl,
      folder: media.folder,
      mimeType: media.mimeType,
      format: media.format,
      width: media.width,
      height: media.height,
      bytes: media.bytes,
      version: media.version,
      altText: media.altText,
      isPrimary: media.isPrimary,
      sortOrder: media.sortOrder,
      createdAt: media.createdAt,
    };
  }

  async delete(mediaId: string): Promise<{ success: boolean }> {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new Error("Media not found");
    }

    const config = await this.getConfig();
    if (config.enableDelete) {
      try {
        await deleteFromCloudinary(media.publicId);
      } catch (error) {
        console.error("Failed to delete media from Cloudinary:", error);
      }
    }

    await prisma.media.delete({ where: { id: mediaId } });

    return { success: true };
  }

  async deleteMultiple(mediaIds: string[]): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const mediaItems = await prisma.media.findMany({
      where: { id: { in: mediaIds } },
    });

    const publicIds = mediaItems.map((m) => m.publicId);
    const errors: string[] = [];
    let deleted = 0;

    const config = await this.getConfig();
    if (config.enableDelete && publicIds.length > 0) {
      const result = await deleteMultipleFromCloudinary(publicIds);
      deleted = result.deleted;
      errors.push(...result.errors);
    }

    await prisma.media.deleteMany({
      where: { id: { in: mediaIds } },
    });

    return { deleted: mediaItems.length, errors };
  }

  async getByEntity(
    entityType: string,
    entityId: string
  ): Promise<MediaUploadResult[]> {
    const mediaItems = await prisma.media.findMany({
      where: { entityType, entityId },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });

    return mediaItems.map((m) => ({
      id: m.id,
      publicId: m.publicId,
      url: m.url,
      secureUrl: m.secureUrl,
      folder: m.folder,
      mimeType: m.mimeType,
      format: m.format,
      width: m.width,
      height: m.height,
      bytes: m.bytes,
      version: m.version,
      altText: m.altText,
      isPrimary: m.isPrimary,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt,
    }));
  }

  async getById(mediaId: string): Promise<MediaUploadResult | null> {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) return null;

    return {
      id: media.id,
      publicId: media.publicId,
      url: media.url,
      secureUrl: media.secureUrl,
      folder: media.folder,
      mimeType: media.mimeType,
      format: media.format,
      width: media.width,
      height: media.height,
      bytes: media.bytes,
      version: media.version,
      altText: media.altText,
      isPrimary: media.isPrimary,
      sortOrder: media.sortOrder,
      createdAt: media.createdAt,
    };
  }

  async updateOrder(
    mediaUpdates: { id: string; sortOrder: number; isPrimary?: boolean }[]
  ): Promise<void> {
    for (const update of mediaUpdates) {
      await prisma.media.update({
        where: { id: update.id },
        data: {
          sortOrder: update.sortOrder,
          ...(update.isPrimary !== undefined && { isPrimary: update.isPrimary }),
        },
      });
    }
  }

  async findOrphans(): Promise<
    Array<{ publicId: string; folder: string; createdAt: Date }>
  > {
    const dbMedia = await prisma.media.findMany({
      select: { publicId: true, folder: true, createdAt: true },
    });

    const dbPublicIds = new Set(dbMedia.map((m) => m.publicId));
    const orphans: Array<{ publicId: string; folder: string; createdAt: Date }> = [];

    const folders = Object.values(MEDIA_FOLDERS);
    for (const folder of folders) {
      try {
        const resources = await listCloudinaryResources(folder, {
          maxResults: 500,
        });

        for (const resource of resources.resources) {
          if (!dbPublicIds.has(resource.publicId)) {
            orphans.push({
              publicId: resource.publicId,
              folder,
              createdAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error(`Failed to list resources in folder ${folder}:`, error);
      }
    }

    return orphans;
  }

  async cleanupOrphans(): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const orphans = await this.findOrphans();
    const errors: string[] = [];
    let deleted = 0;

    for (const orphan of orphans) {
      try {
        await deleteFromCloudinary(orphan.publicId);
        deleted++;
      } catch (error) {
        errors.push(`Failed to delete orphan ${orphan.publicId}: ${error}`);
      }
    }

    return { deleted, errors };
  }

  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number | "auto";
      format?: "auto" | "webp" | "png" | "jpg" | "avif";
      crop?: "fill" | "fit" | "scale" | "thumb" | "limit";
    }
  ): string {
    return getOptimizedUrl(publicId, options);
  }

  getThumbnailUrl(publicId: string, size?: number): string {
    return getThumbnailUrl(publicId, size);
  }

  getResponsiveUrls(publicId: string) {
    return getResponsiveUrls(publicId);
  }

  async getConfig() {
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
      rootFolder: process.env.CLOUDINARY_ROOT_FOLDER || "store",
      enableDelete: process.env.CLOUDINARY_ENABLE_DELETE !== "false",
      deleteOldOnReplace: process.env.CLOUDINARY_DELETE_OLD_ON_REPLACE !== "false",
      cleanupOrphans: process.env.CLOUDINARY_CLEANUP_ORPHANS === "true",
    };
  }

  async validateFile(
    file: File
  ): Promise<MediaValidationResult> {
    const warnings: string[] = [];

    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      return { valid: false, error: sizeValidation.error };
    }

    const typeValidation = validateFileType(file.type);
    if (!typeValidation.valid) {
      return { valid: false, error: typeValidation.error };
    }

    if (file.size < 1024) {
      warnings.push("File is very small and may appear blurry");
    }

    return { valid: true, warnings };
  }

  private async updateProductImageReferences(
    entityType: string,
    entityId: string | null,
    oldPublicId: string,
    newPublicId: string,
    newUrl: string
  ): Promise<void> {
    if (entityType === "product" && entityId) {
      await prisma.productImage.updateMany({
        where: { productId: entityId, publicId: oldPublicId },
        data: { publicId: newPublicId, url: newUrl },
      });
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;
