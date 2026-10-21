import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import ColourTool from "../../src/lib/components/ColourTool";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("ColourTool", () => {
  it("converts a hex value to rgb and hsl", async () => {
    render(() => <ColourTool />);
    await fireEvent.input(screen.getByLabelText("Colour"), {
      target: { value: "#ff0000" },
    });
    expect(screen.getByText("#FF0000")).toBeInTheDocument();
    expect(screen.getByText("rgb(255, 0, 0)")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 100%, 50%)")).toBeInTheDocument();
  });

  it("accepts rgb() input and reports an error for junk", async () => {
    render(() => <ColourTool />);
    await fireEvent.input(screen.getByLabelText("Colour"), {
      target: { value: "rgb(0, 128, 255)" },
    });
    expect(screen.getByText("#0080FF")).toBeInTheDocument();

    await fireEvent.input(screen.getByLabelText("Colour"), {
      target: { value: "notacolour" },
    });
    expect(screen.getByText(/unrecognised colour format/)).toBeInTheDocument();
  });
});
