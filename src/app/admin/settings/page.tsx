"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DEFAULT_STORE_SETTINGS, StoreSettingsData } from "@/services/settings.service";
import { SingleImageUpload } from "@/components/shared/single-image-upload";

type SettingTab = "general" | "branding" | "contact" | "social" | "business" | "legal" | "seo" | "theme";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("general");
  const [formData, setFormData] = useState<StoreSettingsData>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setFormData(d.data);
        }
      })
      .catch(() => toast.error("فشل في تحميل إعدادات المتجر"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: keyof StoreSettingsData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const resData = await res.json();

      if (resData.success) {
        toast.success(resData.message || "تم حفظ الإعدادات بنجاح!");
        if (resData.data) {
          setFormData(resData.data);
        }
      } else {
        toast.error(resData.error || "حدث خطأ أثناء الحفظ");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  }

  function handleResetDefaults() {
    if (confirm("هل أنت متأكد من إعادة الإعدادات إلى الوضع الافتراضي؟")) {
      setFormData(DEFAULT_STORE_SETTINGS);
      toast.info("تم إعادة تعيين القيم الافتراضية. اضغط حفظ لتطبيق التغييرات.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">إعدادات المتجر الشاملة</h1>
        <div className="h-96 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const tabs: { id: SettingTab; label: string; icon: string }[] = [
    { id: "general", label: "معلومات عامة", icon: "🏢" },
    { id: "branding", label: "الهوية البصرية", icon: "🎨" },
    { id: "contact", label: "التواصل والعنوان", icon: "📞" },
    { id: "social", label: "وسائل التواصل", icon: "🌐" },
    { id: "business", label: "العملة والعمليات", icon: "💼" },
    { id: "legal", label: "الفواتير والطباعة والقانونية", icon: "🧾" },
    { id: "seo", label: "محركات البحث (SEO)", icon: "🔍" },
    { id: "theme", label: "المظهر والألوان", icon: "✨" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إعدادات المتجر الشاملة</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            التحكم الكامل بكافة معلومات، شعارات، وتفاصيل المتجر بدون الحاجة لتعديل الكود
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDefaults}
            className="rounded-xl"
          >
            إعادة تعيين
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={isSaving}
            className="rounded-xl px-6"
          >
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b pb-2 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
          {/* 1. General Tab */}
          {activeTab === "general" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">المعلومات الأساسية للمتجر</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">اسم المتجر (بالعربية)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">اسم المتجر (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">العنوان الفرعي للمتجر</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleChange("subtitle", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">شعار المتجر (Slogan)</label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => handleChange("slogan", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">الوصف المختصر للمتجر</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">عن المتجر (نبذة تفصيلية)</label>
                <textarea
                  value={formData.about}
                  onChange={(e) => handleChange("about", e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          {/* 2. Branding Tab */}
          {activeTab === "branding" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold">الشعارات والهوية البصرية</h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3 rounded-xl border p-4 bg-background">
                  <label className="block text-sm font-semibold">الشعار الرئيسي (Header Logo)</label>
                  <SingleImageUpload
                    value={formData.logoUrl}
                    onChange={(url) => handleChange("logoUrl", url || "")}
                    entityType="setting"
                    entityId="logoUrl"
                    folder="settings/logos"
                  />
                </div>

                <div className="space-y-3 rounded-xl border p-4 bg-background">
                  <label className="block text-sm font-semibold">شعار الوضع الداكن (Dark Mode Logo)</label>
                  <SingleImageUpload
                    value={formData.darkLogoUrl}
                    onChange={(url) => handleChange("darkLogoUrl", url || "")}
                    entityType="setting"
                    entityId="darkLogoUrl"
                    folder="settings/logos"
                  />
                </div>

                <div className="space-y-3 rounded-xl border p-4 bg-background">
                  <label className="block text-sm font-semibold">شعار الفوتر (Footer Logo)</label>
                  <SingleImageUpload
                    value={formData.footerLogoUrl}
                    onChange={(url) => handleChange("footerLogoUrl", url || "")}
                    entityType="setting"
                    entityId="footerLogoUrl"
                    folder="settings/logos"
                  />
                </div>

                <div className="space-y-3 rounded-xl border p-4 bg-background">
                  <label className="block text-sm font-semibold">أيقونة المتصفح (Favicon URL)</label>
                  <SingleImageUpload
                    value={formData.faviconUrl}
                    onChange={(url) => handleChange("faviconUrl", url || "")}
                    entityType="setting"
                    entityId="faviconUrl"
                    folder="settings/favicons"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">بيانات التواصل والعنوان</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">رقم الهاتف الرئيس</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">رقم الواتساب (مع الرمز الدولي)</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">البريد الإلكتروني الرئيسي</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">البريد الإلكتروني للدعم الفني</label>
                  <input
                    type="email"
                    value={formData.secondaryEmail}
                    onChange={(e) => handleChange("secondaryEmail", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">عنوان المتجر والمقر الرئيسي</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">رابط خرائط جوجل (Google Maps Link)</label>
                  <input
                    type="text"
                    value={formData.googleMapsUrl}
                    onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Social Media Tab */}
          {activeTab === "social" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">حسابات التواصل الاجتماعي</h2>
              <p className="text-xs text-muted-foreground">تظهر الأيقونات تلقائياً في الفوتر وتختفي الحسابات الفارغة</p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">فيسبوك (Facebook)</label>
                  <input
                    type="text"
                    value={formData.facebook}
                    onChange={(e) => handleChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">إنستغرام (Instagram)</label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">إكس / تويتر (X / Twitter)</label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                    placeholder="https://x.com/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">تيك توك (TikTok)</label>
                  <input
                    type="text"
                    value={formData.tiktok}
                    onChange={(e) => handleChange("tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">يوتيوب (YouTube)</label>
                  <input
                    type="text"
                    value={formData.youtube}
                    onChange={(e) => handleChange("youtube", e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">لينكد إن (LinkedIn)</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">تيليجرام (Telegram)</label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => handleChange("telegram", e.target.value)}
                    placeholder="https://t.me/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">سناب شات (Snapchat)</label>
                  <input
                    type="text"
                    value={formData.snapchat}
                    onChange={(e) => handleChange("snapchat", e.target.value)}
                    placeholder="https://snapchat.com/add/..."
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Business Tab */}
          {activeTab === "business" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">إعدادات العملة والمتجر</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">كود العملة (e.g. SAR, USD)</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">رمز العملة (e.g. ر.س, $)</label>
                  <input
                    type="text"
                    value={formData.currencySymbol}
                    onChange={(e) => handleChange("currencySymbol", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">موقع رمز العملة</label>
                  <select
                    value={formData.currencyPosition}
                    onChange={(e) => handleChange("currencyPosition", e.target.value as "left" | "right")}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                  >
                    <option value="right">يمين المبلغ (e.g. 100 ر.س)</option>
                    <option value="left">يسار المبلغ (e.g. $100)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">نسبة الضريبة المضافة (%)</label>
                  <input
                    type="text"
                    value={formData.taxPercentage}
                    onChange={(e) => handleChange("taxPercentage", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Legal & Invoice Tab */}
          {activeTab === "legal" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">بيانات الفواتير والطباعة والمعلومات القانونية</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">الرقم الضريبي (Tax Identification Number)</label>
                  <input
                    type="text"
                    value={formData.taxNumber || ""}
                    onChange={(e) => handleChange("taxNumber", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">رقم السجل التجاري (Commercial Register)</label>
                  <input
                    type="text"
                    value={formData.commercialRegister || ""}
                    onChange={(e) => handleChange("commercialRegister", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">اسم وتفاصيل الشركة القانونية (تظهر في ترويسة الفواتير)</label>
                <input
                  type="text"
                  value={formData.companyInformation || ""}
                  onChange={(e) => handleChange("companyInformation", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">نص تذييل الفاتورة الرسمي (Invoice Information)</label>
                <textarea
                  value={formData.invoiceInformation || ""}
                  onChange={(e) => handleChange("invoiceInformation", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">نص شكر وتنبيهات الإيصال (Receipt Note)</label>
                <textarea
                  value={formData.receiptInformation || ""}
                  onChange={(e) => handleChange("receiptInformation", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">حقوق النشر (Copyright Text)</label>
                <input
                  type="text"
                  value={formData.copyright || ""}
                  onChange={(e) => handleChange("copyright", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                />
              </div>
            </div>
          )}

          {/* 6. SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">إعدادات محركات البحث (SEO)</h2>

              <div>
                <label className="mb-2 block text-sm font-semibold">عنوان الصفحة الرئيسي (Meta Title)</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">وصف الموقع لمحركات البحث (Meta Description)</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">الكلمات المفتاحية (Keywords separated by commas)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleChange("keywords", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">صورة المشاركة (Open Graph Image)</label>
                <SingleImageUpload
                  value={formData.ogImageUrl}
                  onChange={(url) => handleChange("ogImageUrl", url || "")}
                  entityType="setting"
                  entityId="ogImageUrl"
                  folder="settings/og"
                />
              </div>
            </div>
          )}

          {/* 7. Theme Tab */}
          {activeTab === "theme" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-lg font-bold">المظهر والألوان</h2>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">النمط الافتراضي للمظهر</label>
                  <select
                    value={formData.defaultTheme}
                    onChange={(e) => handleChange("defaultTheme", e.target.value as "light" | "dark" | "system")}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                  >
                    <option value="system">حسب النظام تلقائياً (System)</option>
                    <option value="light">الوضع الفاتح (Light)</option>
                    <option value="dark">الوضع الداكن (Dark)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">انحناء الزوايا (Border Radius)</label>
                  <input
                    type="text"
                    value={formData.borderRadius}
                    onChange={(e) => handleChange("borderRadius", e.target.value)}
                    placeholder="0.75rem"
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">اللون الرئيسي (Primary Color Hex)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor || "#2563eb"}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-xl border bg-background p-1"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">اللون الثانوي (Secondary Color Hex)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondaryColor || "#475569"}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="h-11 w-14 cursor-pointer rounded-xl border bg-background p-1"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetDefaults}
              className="rounded-xl"
            >
              إعادة تعيين
            </Button>
            <Button
              type="submit"
              isLoading={isSaving}
              className="rounded-xl px-8"
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
