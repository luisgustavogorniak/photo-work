import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Photo Work — Gestão para Estúdios de Fotografia",
  description:
    "Sistema completo de gestão para estúdios de fotografia. Controle seus pedidos, produção, estoque e financeiro em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
