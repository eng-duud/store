import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        children: true,
        positions: true,
      },
      orderBy: { code: "asc" },
    });

    const positions = await prisma.position.findMany({
      include: {
        department: true,
      },
      orderBy: { hierarchyLevel: "asc" },
    });

    const authorityRules = await prisma.authorityMatrixRule.findMany({
      orderBy: { module: "asc" },
    });

    const delegations = await prisma.delegationRecord.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      departments,
      positions,
      authorityRules,
      delegations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch organization structure" },
      { status: 500 }
    );
  }
}
