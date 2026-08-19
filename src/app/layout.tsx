import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestão de Obra",
  description: "Sistema de gestão de obra para marcenaria, obra, projeto, marmoraria e vidraçaria",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gestão de Obra",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

// Aplica a preferência de tema salva (claro/escuro) antes da página
// pintar, pra não piscar o tema errado por uma fração de segundo.
const themeInitScript = `
(function () {
  try {
    var tema = localStorage.getItem("tema");
    if (tema === "light" || tema === "dark") {
      document.documentElement.classList.add(tema);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
