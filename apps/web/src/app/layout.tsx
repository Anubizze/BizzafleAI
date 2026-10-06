import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const ui = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bizaffle AI",
    template: "%s · Bizaffle AI",
  },
  description:
    "AI-команда для бизнеса в Казахстане: бухгалтер, юрист и консультант в одном продукте.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body className={`${serif.variable} ${ui.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
