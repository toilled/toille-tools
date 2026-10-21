import { createSignal, createMemo, Show } from "solid-js";
import "./EdgeBenchmarkTool.css";
import {
  type BenchmarkSample,
  type BenchmarkSummary,
  calculateSummary,
  runSingleEdgeProbe,
} from "$lib/benchmark/edge-metrics";
import { copyText } from "$lib/clipboard";
import BenchmarkMetricsGrid from "./BenchmarkMetricsGrid";
import BenchmarkProbeChart from "./BenchmarkProbeChart";

export default function EdgeBenchmarkTool() {
  const [isRunning, setIsRunning] = createSignal(false);
  const [samples, setSamples] = createSignal<BenchmarkSample[]>([]);
  const summary = createMemo<BenchmarkSummary>(() =>
    calculateSummary(samples()),
  );
  const [copied, setCopied] = createSignal(false);

  async function runBenchmark(numProbes = 5) {
    if (isRunning()) return;
    setIsRunning(true);
    setSamples([]);

    const probePromises = Array.from({ length: numProbes }, (_, i) =>
      runSingleEdgeProbe("/manifest.webmanifest", i + 1),
    );
    const collected = await Promise.all(probePromises);
    setSamples(collected);

    setIsRunning(false);
  }

  function copyJson() {
    const data = JSON.stringify(summary(), null, 2);
    void copyText(data, setCopied, 2000);
  }

  return (
    <div
      class="benchmark-panel"
      role="region"
      aria-label="Edge Latency Benchmark Probe"
    >
      <div class="benchmark-header-row">
        <div class="benchmark-title-wrap">
          <h4 class="benchmark-title">CLOUDFLARE EDGE LATENCY PROBE</h4>
          <span class="benchmark-subtitle">
            GLOBAL POP BENCHMARK & ROUND-TRIP TTFB ANALYSIS
          </span>
        </div>

        <div class="benchmark-actions">
          <button
            type="button"
            class="benchmark-btn"
            disabled={isRunning()}
            onClick={() => runBenchmark(5)}
            aria-label="Run 5-probe benchmark"
          >
            <span>
              {isRunning() ? "⏳ PROBING EDGE …" : "⚡ RUN 5-POINT PROBE"}
            </span>
          </button>
          <Show when={samples().length > 0}>
            <button
              type="button"
              class="benchmark-btn"
              onClick={copyJson}
              aria-label="Copy JSON report"
            >
              <span>{copied() ? "✓ COPIED JSON" : "📋 EXPORT TELEMETRY"}</span>
            </button>
          </Show>
          <span class="sr-only" role="status" aria-live="polite">
            {isRunning()
              ? "Probing edge latency"
              : copied()
                ? "Telemetry copied to clipboard"
                : ""}
          </span>
        </div>
      </div>

      <BenchmarkMetricsGrid summary={summary()} />
      <BenchmarkProbeChart samples={samples()} maxMs={summary().maxMs} />
    </div>
  );
}
