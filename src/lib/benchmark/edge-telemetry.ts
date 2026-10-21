/**
 * Edge Telemetry Engine
 * Live round-trip latency and Cloudflare PoP (Point of Presence) probe.
 */

export interface EdgeTelemetryResult {
  latencyMs: number;
  pop: string;
  isLive: boolean;
}

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * Extracts Cloudflare colocation airport code from /cdn-cgi/trace output.
 * e.g. "colo=LHR" -> "LHR"
 */
export function parseCloudflareColo(text: string): string | null {
  if (!text) return null;
  const match = text.match(/^colo=([A-Z0-9]+)$/m);
  return match ? match[1] : null;
}

/**
 * Extracts Cloudflare PoP from the cf-ray response header.
 * e.g. "8c7e9f3b12345678-LHR" -> "LHR"
 */
export function parseCfRayColo(cfRay: string | null): string | null {
  if (!cfRay) return null;
  const parts = cfRay.split("-");
  return parts.length > 1 ? parts[parts.length - 1].trim().toUpperCase() : null;
}

async function probeFallback(start: number): Promise<EdgeTelemetryResult> {
  try {
    const res = await fetch("/manifest.webmanifest", { cache: "no-store" });
    const cfRay = res.headers.get("cf-ray");
    const pop = parseCfRayColo(cfRay) || "EDGE";
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return { latencyMs, pop, isLive: true };
  } catch {
    return { latencyMs: 0, pop: "EDGE", isLive: false };
  }
}

/**
 * Performs a live probe against Cloudflare's edge network.
 * Measures round-trip latency and detects nearest Point of Presence (PoP).
 */
export async function probeEdgeTelemetry(): Promise<EdgeTelemetryResult> {
  if (isBrowserOffline()) {
    return { latencyMs: 0, pop: "OFFLINE", isLive: false };
  }

  const start = performance.now();
  try {
    const res = await fetch("/cdn-cgi/trace", { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      const pop = parseCloudflareColo(text) || "EDGE";
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      return { latencyMs, pop, isLive: true };
    }
  } catch {
    // Proceed to fallback probe
  }

  return probeFallback(start);
}
