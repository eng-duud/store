import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mediaService } from "@/services/media.service";
import { MEDIA_FOLDERS, type MediaFolder } from "@/lib/cloudinary";

const FOLDER_MAP: Record<string, MediaFolder> = {
  products: MEDIA_FOLDERS.PRODUCTS,
  "product-gallery": MEDIA_FOLDERS.PRODUCT_GALLERY,
  categories: MEDIA_FOLDERS.CATEGORIES,
  brands: MEDIA_FOLDERS.BRANDS,
  users: MEDIA_FOLDERS.USERS,
  customers: MEDIA_FOLDERS.CUSTOMERS,
  "store-logo": MEDIA_FOLDERS.STORE_LOGO,
  "store-banner": MEDIA_FOLDERS.STORE_BANNER,
  promotions: MEDIA_FOLDERS.PROMOTIONS,
  system: MEDIA_FOLDERS.SYSTEM,
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const entityType = (formData.get("entityType") as string) || "system";
    const entityId = (formData.get("entityId") as string) || undefined;
    const folderKey = (formData.get("folder") as string) || "system";
    const altText = (formData.get("altText") as string) || undefined;
    const isPrimary = formData.get("isPrimary") === "true";
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validation = await mediaService.validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = FOLDER_MAP[folderKey] || MEDIA_FOLDERS.SYSTEM;

    const result = await mediaService.upload({
      file: buffer,
      entityType,
      entityId,
      folder,
      altText,
      fileName: file.name,
      mimeType: file.type,
      isPrimary,
      sortOrder,
      uploadedBy: (session.user as any).id,
    });

    return NextResponse.json({
      success: true,
      data: result,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const folder = searchParams.get("folder");

    if (entityType && entityId) {
      const media = await mediaService.getByEntity(entityType, entityId);
      return NextResponse.json({ success: true, data: media });
    }

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (folder) where.folder = folder;

    const media = await prisma.media.findMany({
      where,
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      take: 100,
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list media" },
      { status: 500 }
    );
  }
}
