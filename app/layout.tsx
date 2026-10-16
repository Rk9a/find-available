import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Find Available KFUPM",
  description: "Find available rooms at KFUPM based on building, day, and time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrains.variable}>
      <body className="antialiased">
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>

            <Separator />
            <footer className="bg-card py-3 text-center text-xs tracking-wider text-muted-foreground">
              {new Date().getFullYear()} • Designed by Rayan
              {" • "}
              <Link
                href="/info"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                About
              </Link>
            </footer>
          </div>
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
