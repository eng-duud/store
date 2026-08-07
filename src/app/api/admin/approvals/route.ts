import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processDbApprovalDecision, createDbApprovalRequest } from "@/lib/approval-engine";

export async function GET() {
  try {
    const requests = await prisma.approvalRequest.findMany({
      include: {
        decisions: {
          orderBy: { createdAt: "asc" },
        },
        escalations: {
          orderBy: { escalatedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch approval requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actionType, requestId, documentType, documentId, documentNumber, amount, requesterId, requesterName, notes, approverId, approverName, approverPositionCode, action, comments } = body;

    if (actionType === "CREATE") {
      const request = await createDbApprovalRequest(
        documentType,
        documentId,
        documentNumber,
        Number(amount),
        requesterId || "sys-user",
        requesterName || "مستخدم النظام",
        notes
      );
      return NextResponse.json({ success: true, request });
    }

    if (actionType === "DECISION") {
      const updatedRequest = await processDbApprovalDecision(
        requestId,
        approverId || "sys-approver",
        approverName || "معتمد النظام",
        approverPositionCode || "FINANCE_MANAGER",
        action,
        comments
      );
      return NextResponse.json({ success: true, request: updatedRequest });
    }

    return NextResponse.json({ success: false, error: "Invalid actionType" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process approval request" },
      { status: 500 }
    );
  }
}
