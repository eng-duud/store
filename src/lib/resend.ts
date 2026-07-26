import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || "noreply@yourdomain.com",
}: SendEmailOptions): Promise<void> {
  await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

export async function sendOrderConfirmation(
  to: string,
  orderNumber: string,
  total: number
): Promise<void> {
  await sendEmail({
    to,
    subject: `تأكيد الطلب ${orderNumber}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>تم استلام طلبك بنجاح</h2>
        <p>رقم الطلب: <strong>${orderNumber}</strong></p>
        <p>المبلغ الإجمالي: <strong>${total.toFixed(2)} ر.س</strong></p>
        <p>سنتواصل معك قريباً لتوصيل طلبك.</p>
        <hr style="margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">شكلاً لتسوقك من متجرنا</p>
      </div>
    `,
  });
}

export async function sendPasswordReset(
  to: string,
  resetUrl: string
): Promise<void> {
  await sendEmail({
    to,
    subject: "إعادة تعيين كلمة المرور",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>إعادة تعيين كلمة المرور</h2>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاص بك.</p>
        <p>انقر على الرابط أدناه لإعادة التعيين:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin-top:10px;">
          إعادة تعيين كلمة المرور
        </a>
        <p style="margin-top:20px;color:#666;">إ لم تطلب هذا، يرجى تجاهل هذا البريد.</p>
      </div>
    `,
  });
}

export async function sendOrderStatusUpdate(
  to: string,
  orderNumber: string,
  status: string,
  statusLabel: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `تحديث حالة الطلب ${orderNumber}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>تحديث حالة طلبك</h2>
        <p>رقم الطلب: <strong>${orderNumber}</strong></p>
        <p>الحالة الجديدة: <strong>${statusLabel}</strong></p>
      </div>
    `,
  });
}

export default resend;
