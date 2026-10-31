import Script from "next/script";
import { gaMeasurementId } from "@/lib/site";

export function GoogleAnalytics() {
  if (!gaMeasurementId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}');
        `}
      </Script>
    </>
  );
}
