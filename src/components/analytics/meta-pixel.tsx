"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Meta Pixel Component
 *
 * Installs the Meta Pixel (Facebook Pixel) for browser-side event tracking.
 * Events tracked here will be automatically deduplicated with CAPI events
 * using matching event_id values.
 *
 * Automatically tracks PageView events on initial load and route changes.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const pathname = usePathname();

  // Track PageView on route changes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname]);

  // Don't render if pixel ID is not configured
  if (!pixelId) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* Noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track a Meta Pixel event with deduplication support
 *
 * This function fires a pixel event and also sends it to our backend
 * for CAPI forwarding. Both use the same eventId to prevent double-counting.
 */
export function trackMetaPixelEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  // Generate event ID if not provided (for deduplication)
  const dedupEventId = eventId || crypto.randomUUID();

  // Track via Pixel
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, params || {}, {
      eventID: dedupEventId, // Critical for deduplication!
    });
  }

  // Send to backend for CAPI forwarding
  fetch("/api/growth/events/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "meta",
      eventName,
      properties: params,
      eventId: dedupEventId, // Same eventId for CAPI deduplication
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      eventSourceUrl: window.location.href,
    }),
  }).catch((error) => {
    console.error("Failed to track Meta event:", error);
  });
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}
