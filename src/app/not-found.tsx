import { GeistSans } from "geist/font/sans";

// Fallback for URLs outside the locale routes; localized 404s live in app/[locale]/not-found.tsx.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="grid min-h-screen place-items-center bg-background font-sans text-foreground">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
          <a href="/" className="mt-4 inline-block text-sm underline">
            Back to Rituel Cards
          </a>
        </div>
      </body>
    </html>
  );
}
