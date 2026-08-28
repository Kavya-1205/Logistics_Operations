import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "UPS Logistics Operations Intelligence Platform",
  description:
    "AI-powered predictive forecasting, workforce capacity planning, and resource optimization platform for UPS logistics operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d0f14] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-gray-950">
        <Navbar />
        <div className="flex-1 flex w-full">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
