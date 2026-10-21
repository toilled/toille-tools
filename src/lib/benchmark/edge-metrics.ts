// fallow-ignore-file security-sink -- this file builds perf measurement URLs from a user-supplied benchmark endpoint; it performs the request but sends no secrets or tokens
/**
 * Edge Latency Benchmark Engine
 * High-precision network performance measurement and statistical metrics calculator.
 */

export interface BenchmarkSample {
  runIndex: number;
  ttfbMs: number;
  totalMs: number;
  status: number;
  timestamp: string;
}

export interface BenchmarkSummary {
  samples: BenchmarkSample[];
  minMs: number;
  maxMs: number;
  avgMs: number;
  p90Ms: number;
  jitterMs: number;
  completedRuns: number;
}

export function calculateSummary(samples: BenchmarkSample[]): BenchmarkSummary {
  const len = samples.length;
  if (len === 0) {
    return {
      samples: [],
      minMs: 0,
      maxMs: 0,
      avgMs: 0,
      p90Ms: 0,
      jitterMs: 0,
      completedRuns: 0,
    };
  }

  const times = new Float64Array(len);
  let sum = 0;
  let jitterSum = 0;

  for (let i = 0; i < len; i++) {
    const t = samples[i].totalMs;
    times[i] = t;
    sum += t;
    if (i > 0) {
      jitterSum += Math.abs(t - samples[i - 1].totalMs);
    }
  }

  times.sort();
  const minMs = Math.round(times[0] * 10) / 10;
  const maxMs = Math.round(times[len - 1] * 10) / 10;
  const avgMs = Math.round((sum / len) * 10) / 10;

  // p90 calculation
  const p90Index = Math.min(Math.floor(len * 0.9), len - 1);
  const p90Ms = Math.round(times[p90Index] * 10) / 10;

  // Jitter (mean absolute difference between consecutive samples)
  const jitterMs = len > 1 ? Math.round((jitterSum / (len - 1)) * 10) / 10 : 0;

  return {
    samples,
    minMs,
    maxMs,
    avgMs,
    p90Ms,
    jitterMs,
    completedRuns: len,
  };
}

function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates that an edge probe target URL is safe (relative path or explicit http/https protocol).
 */
export function isValidProbeUrl(url: string): boolean {
  if (typeof url !== "string" || !url) return false;
  if (url.startsWith("//")) return false;
  if (url.startsWith("/")) return true;
  return isAbsoluteHttpUrl(url);
}

function hasPerformanceApi(): boolean {
  return (
    typeof performance !== "undefined" &&
    typeof performance.getEntriesByName === "function"
  );
}

function hasValidResponseStart(
  entry?: PerformanceResourceTiming,
): entry is PerformanceResourceTiming {
  return Boolean(
    entry && typeof entry.responseStart === "number" && entry.responseStart > 0,
  );
}

function getValidTimingEntry(
  targetUrl: string,
): PerformanceResourceTiming | null {
  if (!hasPerformanceApi()) return null;
  const entries = performance.getEntriesByName(
    targetUrl,
  ) as PerformanceResourceTiming[];
  if (!entries.length) return null;
  const entry = entries[entries.length - 1];
  return hasValidResponseStart(entry) ? entry : null;
}

/**
 * Resolves TTFB from the Resource Timing API when available, or falls back to an estimate.
 */
export function extractTtfbFromPerformance(
  targetUrl: string,
  totalMs: number,
): number {
  const entry = getValidTimingEntry(targetUrl);
  if (!entry) return estimateTtfb(totalMs);

  const startTime =
    entry.requestStart > 0 ? entry.requestStart : entry.startTime;
  const measuredTtfb = entry.responseStart - startTime;
  if (measuredTtfb < 0 || measuredTtfb > totalMs) {
    return estimateTtfb(totalMs);
  }
  return Math.round(measuredTtfb * 10) / 10;
}

function estimateTtfb(totalMs: number): number {
  return Math.round(totalMs * 0.7 * 10) / 10;
}

export async function runSingleEdgeProbe(
  url: string,
  runIndex: number,
): Promise<BenchmarkSample> {
  if (!isValidProbeUrl(url)) {
    return {
      runIndex,
      ttfbMs: 0,
      totalMs: 0,
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  const start = performance.now();
  let status: number;
  const cacheBuster = `_t=${Date.now()}_${runIndex}`;
  const targetUrl = url.includes("?")
    ? `${url}&${cacheBuster}`
    : `${url}?${cacheBuster}`;

  try {
    const res = await fetch(targetUrl, { method: "GET", cache: "no-store" });
    status = res.status;
    await res.text();
  } catch {
    status = 500;
  }

  const totalMs = Math.round((performance.now() - start) * 10) / 10;
  const ttfbMs = extractTtfbFromPerformance(targetUrl, totalMs);

  return {
    runIndex,
    ttfbMs,
    totalMs,
    status,
    timestamp: new Date().toISOString(),
  };
}
