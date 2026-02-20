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
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <main style={{ flex: 1 }}>
      {children}
    </main>

    <footer
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    textAlign: "center",
    padding: "12px 0",
    fontSize: "13px",
    letterSpacing: "1px",
    opacity: 0.7,
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e5e5e5",
  }}
>
   {new Date().getFullYear()} • Designed by Rayan
</footer>
  </div>
</body>
    </html>
  );
}