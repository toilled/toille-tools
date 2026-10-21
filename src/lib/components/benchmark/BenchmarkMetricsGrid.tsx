import type { BenchmarkSummary } from "$lib/benchmark/edge-metrics";

interface Props {
  summary: BenchmarkSummary;
}

export default function BenchmarkMetricsGrid(props: Props) {
  return (
    <div class="benchmark-stats-grid">
      <div class="metric-card">
        <span class="metric-label">MIN LATENCY</span>
        <span class="metric-val neon-cyan">{props.summary.minMs} ms</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">AVG LATENCY</span>
        <span class="metric-val neon-purple">{props.summary.avgMs} ms</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">P90 LATENCY</span>
        <span class="metric-val neon-pink">{props.summary.p90Ms} ms</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">MAX LATENCY</span>
        <span class="metric-val neon-yellow">{props.summary.maxMs} ms</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">NETWORK JITTER</span>
        <span class="metric-val cyan">{props.summary.jitterMs} ms</span>
      </div>
    </div>
  );
}
