import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import RegexTool from "../../src/lib/components/RegexTool";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("RegexTool", () => {
  it("highlights matches live and reports a count", async () => {
    const { container } = render(() => <RegexTool />);
    await fireEvent.input(screen.getByLabelText("Pattern"), {
      target: { value: "\\d+" },
    });
    await fireEvent.input(screen.getByLabelText("Test string"), {
      target: { value: "a1 b22 c" },
    });
    expect(container.querySelectorAll(".match")).toHaveLength(2);
    expect(screen.getByText(/2 matches/)).toBeInTheDocument();
  });

  it("shows an error for an invalid pattern", async () => {
    render(() => <RegexTool />);
    await fireEvent.input(screen.getByLabelText("Pattern"), {
      target: { value: "(" },
    });
    await fireEvent.input(screen.getByLabelText("Test string"), {
      target: { value: "abc" },
    });
    expect(screen.getByText(/error:/)).toBeInTheDocument();
  });

  it("flags potentially catastrophic nested quantifiers on large input", async () => {
    render(() => <RegexTool />);
    await fireEvent.input(screen.getByLabelText("Pattern"), {
      target: { value: "(a+)+" },
    });
    await fireEvent.input(screen.getByLabelText("Test string"), {
      target: { value: "a".repeat(2500) },
    });
    expect(
      screen.getByText(
        /nested quantifiers with high catastrophic backtracking risk/,
      ),
    ).toBeInTheDocument();
  });
});
