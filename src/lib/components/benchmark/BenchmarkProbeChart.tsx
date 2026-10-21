import { For, Show } from "solid-js";
import type { BenchmarkSample } from "$lib/benchmark/edge-metrics";

interface Props {
  samples: BenchmarkSample[];
  maxMs: number;
}

export default function BenchmarkProbeChart(props: Props) {
  return (
    <div class="benchmark-chart-wrap">
      <div class="chart-header">
        <span>PROBE EXECUTION</span>
        <span>MEASURED ROUND-TRIP</span>
      </div>

      <Show
        when={props.samples.length > 0}
        fallback={
          <span class="mono dim">
            ▸ Click &apos;RUN 5-POINT PROBE&apos; to measure live edge latency
            from your location.
          </span>
        }
      >
        <div class="chart-bars-list">
          <For each={props.samples}>
            {(sample) => (
              <div class="sample-row">
                <span class="cyan">PROBE #{sample.runIndex}</span>
                <div class="sample-bar-track" aria-hidden="true">
                  <div
                    class="sample-bar-fill"
                    style={{
                      width: `${Math.min(100, Math.max(8, (sample.totalMs / Math.max(props.maxMs, 50)) * 100))}%`,
                    }}
                  />
                </div>
                <span class="yellow">{sample.totalMs} ms</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
