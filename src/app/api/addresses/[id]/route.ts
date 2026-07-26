import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateAddress, deleteAddress } from "@/services/customer.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const address = await updateAddress(id, session.user.id, body);
    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteAddress(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
