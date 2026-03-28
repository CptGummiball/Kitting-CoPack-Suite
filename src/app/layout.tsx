import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Kitting & CoPack Suite",
  description: "Professionelle Kitting- und CoPack-Verwaltung für Produktion und Logistik",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
