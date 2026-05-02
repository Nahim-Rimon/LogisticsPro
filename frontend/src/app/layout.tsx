import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import ChatWidget from "@/components/ChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";

const raleway = Raleway({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Supply Chain Logistics",
  description: "Advanced Shipment Tracking and Logistics Management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  return (

    <html lang="en" suppressHydrationWarning>
      <body
        className={`${raleway.variable} font-sans antialiased lining-nums tabular-nums`}
      >
        <ClerkProvider dynamic>
          <ThemeProvider attribute="class" defaultTheme="light" themes={["light", "dark", "gray"]} disableTransitionOnChange>
            {children}
            {userId && <ChatWidget />}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>

  );
}
