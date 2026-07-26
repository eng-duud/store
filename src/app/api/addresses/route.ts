import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserAddresses, createAddress } from "@/services/customer.service";
import { addressSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await getUserAddresses(session.user.id);
    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const address = await createAddress(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
