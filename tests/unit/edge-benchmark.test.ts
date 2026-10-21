import { describe, it, expect, vi } from "vitest";
import {
  calculateSummary,
  runSingleEdgeProbe,
  isValidProbeUrl,
  extractTtfbFromPerformance,
  type BenchmarkSample,
} from "../../src/lib/benchmark/edge-metrics";

describe("Edge Metrics Unit Tests", () => {
  it("handles empty sample set cleanly", () => {
    const summary = calculateSummary([]);
    expect(summary.completedRuns).toBe(0);
    expect(summary.avgMs).toBe(0);
    expect(summary.p90Ms).toBe(0);
    expect(summary.jitterMs).toBe(0);
  });

  it("calculates min, max, avg, p90, and jitter accurately", () => {
    const samples: BenchmarkSample[] = [
      { runIndex: 1, ttfbMs: 14, totalMs: 20, status: 200, timestamp: "" },
      { runIndex: 2, ttfbMs: 21, totalMs: 30, status: 200, timestamp: "" },
      { runIndex: 3, ttfbMs: 28, totalMs: 40, status: 200, timestamp: "" },
      { runIndex: 4, ttfbMs: 35, totalMs: 50, status: 200, timestamp: "" },
      { runIndex: 5, ttfbMs: 70, totalMs: 100, status: 200, timestamp: "" },
    ];

    const summary = calculateSummary(samples);
    expect(summary.completedRuns).toBe(5);
    expect(summary.minMs).toBe(20);
    expect(summary.maxMs).toBe(100);
    expect(summary.avgMs).toBe(48);
    expect(summary.p90Ms).toBe(100);
    expect(summary.jitterMs).toBe(20);
  });

  it("validates probe target URLs", () => {
    expect(isValidProbeUrl("/api/health")).toBe(true);
    expect(isValidProbeUrl("https://example.com/api")).toBe(true);
    expect(isValidProbeUrl("http://localhost:3000")).toBe(true);
    expect(isValidProbeUrl("javascript:alert(1)")).toBe(false);
    expect(isValidProbeUrl("data:text/plain,hello")).toBe(false);
    expect(isValidProbeUrl("//dangerous-domain.com")).toBe(false);
    expect(isValidProbeUrl("")).toBe(false);
    expect(isValidProbeUrl("not-a-valid-url")).toBe(false);
    expect(isValidProbeUrl("ftp://example.com")).toBe(false);

    // Testing non-string and falsy inputs
    expect(isValidProbeUrl(null as any)).toBe(false);
    expect(isValidProbeUrl(undefined as any)).toBe(false);
    expect(isValidProbeUrl(123 as any)).toBe(false);
    expect(isValidProbeUrl({} as any)).toBe(false);
  });

  it("rejects invalid probe URLs with status 400", async () => {
    const probe = await runSingleEdgeProbe("javascript:alert(1)", 1);
    expect(probe.status).toBe(400);
    expect(probe.ttfbMs).toBe(0);
    expect(probe.totalMs).toBe(0);
  });

  it("executes a single edge probe via fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      text: vi.fn().mockResolvedValue("ok"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const probe = await runSingleEdgeProbe("/manifest.webmanifest", 1);
    expect(probe.runIndex).toBe(1);
    expect(probe.status).toBe(200);
    expect(probe.totalMs).toBeGreaterThanOrEqual(0);

    vi.unstubAllGlobals();
  });

  it("extracts real TTFB from Resource Timing API when entry is present", () => {
    const origGet = performance.getEntriesByName;
    performance.getEntriesByName = vi.fn().mockReturnValue([
      {
        startTime: 10,
        requestStart: 12,
        responseStart: 25,
      } as PerformanceResourceTiming,
    ]);

    const ttfb = extractTtfbFromPerformance("http://test.url", 30);
    expect(ttfb).toBe(13); // 25 - 12

    performance.getEntriesByName = origGet;
  });

  it("falls back to 70% heuristic when Resource Timing entry is absent", () => {
    const origGet = performance.getEntriesByName;
    performance.getEntriesByName = vi.fn().mockReturnValue([]);

    const ttfb = extractTtfbFromPerformance("http://test.url", 40);
    expect(ttfb).toBe(28); // 40 * 0.7

    performance.getEntriesByName = origGet;
  });
});
