import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={jetbrains.className}
        style={{
          backgroundColor: "#ffffff",
          color: "#111111",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}