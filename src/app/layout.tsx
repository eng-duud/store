import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { getStoreSettings } from "@/services/settings.service";
import { auth } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: {
      default: settings.metaTitle || settings.name,
      template: `%s | ${settings.name}`,
    },
    description: settings.metaDescription || settings.description,
    keywords: settings.keywords ? settings.keywords.split(",") : undefined,
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
    },
    openGraph: {
      title: settings.metaTitle || settings.name,
      description: settings.metaDescription || settings.description,
      images: settings.ogImageUrl ? [{ url: settings.ogImageUrl }] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers session={session}>
            {children}
          </Providers>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
