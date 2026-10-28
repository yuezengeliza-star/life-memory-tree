import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "人生记忆树",
  description: "不是所有回忆都需要被看见，但每一段重要的人生都值得被留下。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
