import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isBrowserOffline,
  parseCloudflareColo,
  parseCfRayColo,
  probeEdgeTelemetry,
} from "../../src/lib/benchmark/edge-telemetry";

describe("Edge Telemetry Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects online and offline status cleanly", () => {
    expect(isBrowserOffline()).toBe(false);

    vi.stubGlobal("navigator", { onLine: false });
    expect(isBrowserOffline()).toBe(true);
  });

  it("parses Cloudflare colo from trace text", () => {
    const trace = `fl=843f72\nh=toille.com\nip=127.0.0.1\ncolo=LHR\nhttp=http/3`;
    expect(parseCloudflareColo(trace)).toBe("LHR");
    expect(parseCloudflareColo("foo=bar\ncolo=AMS")).toBe("AMS");
    expect(parseCloudflareColo("no-colo-here")).toBeNull();
    expect(parseCloudflareColo("")).toBeNull();
  });

  it("parses PoP from cf-ray header", () => {
    expect(parseCfRayColo("8c7e9f3b12345678-LHR")).toBe("LHR");
    expect(parseCfRayColo("12345-sjc")).toBe("SJC");
    expect(parseCfRayColo("singlepart")).toBeNull();
    expect(parseCfRayColo(null)).toBeNull();
  });

  it("probes edge telemetry successfully from cdn-cgi/trace", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("colo=LHR\n"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await probeEdgeTelemetry();
    expect(result.isLive).toBe(true);
    expect(result.pop).toBe("LHR");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("falls back to manifest probe when cdn-cgi/trace fails", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("cdn-cgi/trace")) {
        return Promise.reject(new Error("404"));
      }
      return Promise.resolve({
        ok: true,
        headers: {
          get: (name: string) =>
            name.toLowerCase() === "cf-ray" ? "testray-AMS" : null,
        },
      });
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await probeEdgeTelemetry();
    expect(result.isLive).toBe(true);
    expect(result.pop).toBe("AMS");
  });

  it("handles offline condition without fetching", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await probeEdgeTelemetry();
    expect(result.isLive).toBe(false);
    expect(result.pop).toBe("OFFLINE");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
