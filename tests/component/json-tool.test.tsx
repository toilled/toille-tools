import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import JsonTool from "../../src/lib/components/JsonTool";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("JsonTool: format & minify", () => {
  it("pretty-prints valid JSON", async () => {
    render(() => <JsonTool />);
    await fireEvent.input(screen.getByLabelText("Input JSON"), {
      target: { value: '{"a":1,"b":[1,2]}' },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Format" }));

    const output = screen.getByLabelText("Output") as HTMLTextAreaElement;
    expect(output.value).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
    expect(screen.getByText("valid JSON")).toBeInTheDocument();
  });

  it("minifies valid JSON", async () => {
    render(() => <JsonTool />);
    await fireEvent.input(screen.getByLabelText("Input JSON"), {
      target: { value: '{ "a" : 1 }' },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Minify" }));
    expect((screen.getByLabelText("Output") as HTMLTextAreaElement).value).toBe(
      '{"a":1}',
    );
  });
});

describe("JsonTool: validation & sample loading", () => {
  it("reports a clear error for invalid JSON or empty input", async () => {
    render(() => <JsonTool />);
    await fireEvent.input(screen.getByLabelText("Input JSON"), {
      target: { value: "{oops}" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    expect(screen.getByText(/error:/)).toBeInTheDocument();

    await fireEvent.input(screen.getByLabelText("Input JSON"), {
      target: { value: "" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Format" }));
    expect(screen.getByText(/error: nothing to process/)).toBeInTheDocument();
  });

  it("loads sample JSON, validates, clears and copies output", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    render(() => <JsonTool />);
    await fireEvent.click(screen.getByRole("button", { name: "Load Sample" }));
    const input = screen.getByLabelText("Input JSON") as HTMLTextAreaElement;
    expect(input.value).toContain("Elliot");

    await fireEvent.click(screen.getByRole("button", { name: "Format" }));
    await fireEvent.click(screen.getByRole("button", { name: "Copy result" }));
    expect(writeTextMock).toHaveBeenCalled();

    await fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(input.value).toBe("");
  });
});
