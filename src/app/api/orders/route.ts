import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrder, getUserOrders } from "@/services/order.service";
import { checkoutSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page")) || 1;
    const result = await getUserOrders(session.user.id, page);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching orders:", error);
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
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    if (!body.cartItems || body.cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "السلة فارغة" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      userId: session.user.id,
      addressId: parsed.data.addressId,
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes,
      cartItems: body.cartItems,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
