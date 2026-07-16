import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Le Quang Anh | Finance & Deals Analyst", description: "Portfolio of Le Quang Anh — Finance & Deals Analyst, CFA Level II Candidate, and top finance graduate.", openGraph: { title: "Le Quang Anh | Finance & Deals Analyst", description: "CFA Level II Candidate · Top 3 Finance Graduate", images: [{ url: "/og.png", width: 1730, height: 910, alt: "Le Quang Anh portfolio" }] }, twitter: { card: "summary_large_image", images: ["/og.png"] }, icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }


