import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProviderContext } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI SMART | AI Smart Learning Platform",
  description: "Next-Gen EdTech platform powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`} suppressHydrationWarning>
        <AuthProviderContext>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(0 0% 10%)',
                color: 'hsl(0 0% 100%)',
                border: '1px solid hsl(0 0% 20%)',
                borderRadius: '12px',
              },
            }}
          />
        </AuthProviderContext>
      </body>
    </html>
  );
}
