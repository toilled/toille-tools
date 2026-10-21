import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSignal, flush } from "solid-js";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import EdgeBenchmarkTool from "../../src/lib/components/benchmark/EdgeBenchmarkTool";
import BenchmarkProbeChart from "../../src/lib/components/benchmark/BenchmarkProbeChart";

describe("EdgeBenchmarkTool Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        text: vi.fn().mockResolvedValue('{"name":"manifest"}'),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders benchmark panel and initial stats", () => {
    const { getByText } = render(() => <EdgeBenchmarkTool />);

    expect(getByText(/CLOUDFLARE EDGE LATENCY PROBE/i)).toBeInTheDocument();
    expect(getByText(/MIN LATENCY/i)).toBeInTheDocument();
    expect(getByText(/AVG LATENCY/i)).toBeInTheDocument();
    expect(getByText(/P90 LATENCY/i)).toBeInTheDocument();
    expect(getByText(/NETWORK JITTER/i)).toBeInTheDocument();
  });

  it("executes probes when clicking run probe button", async () => {
    const { getByRole, findByText } = render(() => <EdgeBenchmarkTool />);
    const runBtn = getByRole("button", { name: /Run 5-probe benchmark/i });

    await fireEvent.click(runBtn);

    const probeItem = await findByText(/PROBE #1/i);
    expect(probeItem).toBeInTheDocument();
  });

  it("exports and copies telemetry JSON report", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    const { getByRole, findByRole } = render(() => <EdgeBenchmarkTool />);
    const runBtn = getByRole("button", { name: /Run 5-probe benchmark/i });
    await fireEvent.click(runBtn);

    const exportBtn = await findByRole("button", { name: /Copy JSON report/i });
    expect(exportBtn).toBeInTheDocument();
    await fireEvent.click(exportBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });

  it("updates probe bar width reactively when maxMs increases", () => {
    const sample1 = {
      runIndex: 1,
      totalMs: 20,
      ttfbMs: 15,
      downloadMs: 5,
      status: 200,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    const [samples, setSamples] = createSignal([sample1]);
    const [maxMs, setMaxMs] = createSignal(20);

    const { container } = render(() => (
      <BenchmarkProbeChart samples={samples()} maxMs={maxMs()} />
    ));
    const bar = container.querySelector(".sample-bar-fill") as HTMLElement;
    expect(bar.style.width).toBe("40%");

    setSamples([
      sample1,
      {
        runIndex: 2,
        totalMs: 200,
        ttfbMs: 180,
        downloadMs: 20,
        status: 200,
        timestamp: "2026-01-01T00:00:00.000Z",
      },
    ]);
    setMaxMs(200);
    flush();

    expect(bar.style.width).toBe("10%");
  });
});
