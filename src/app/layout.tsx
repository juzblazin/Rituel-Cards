import "./globals.css";

// The <html> shell lives in app/[locale]/layout.tsx so `lang` follows the URL.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
