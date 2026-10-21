import { describe, it, vi } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import EdgeBenchmarkTool from "../../src/lib/components/benchmark/EdgeBenchmarkTool";

describe("EdgeBenchmarkTool Performance", () => {
  it("measures time for runBenchmark", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 50));
        return {
          status: 200,
          text: async () => '{"name":"manifest"}',
        };
      }),
    );

    const { getByRole, findByText } = render(() => <EdgeBenchmarkTool />);
    const runBtn = getByRole("button", { name: /Run 5-probe benchmark/i });

    const start = performance.now();
    await fireEvent.click(runBtn);

    await findByText(/⚡ RUN 5-POINT PROBE/i);
    const end = performance.now();

    console.log(`Baseline time taken: ${end - start}ms`);

    cleanup();
    vi.unstubAllGlobals();
  });
});
