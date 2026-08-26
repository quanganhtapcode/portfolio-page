import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { metadataBase: new URL("https://quanganh.org"), title: "Le Quang Anh | Economics & Finance Researcher", description: "Le Quang Anh is an economics and finance researcher working on empirical banking, corporate finance, development economics, and Vietnam-focused financial data.", openGraph: { title: "Le Quang Anh | Economics & Finance Researcher", description: "Empirical banking · Corporate finance · Development economics", images: [{ url: "/og.png", width: 1730, height: 910, alt: "Le Quang Anh portfolio" }] }, twitter: { card: "summary_large_image", images: ["/og.png"] }, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }


