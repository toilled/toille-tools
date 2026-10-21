import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { cleanupAfterEach } from "../helpers.js";
import RegexResult from "../../src/lib/components/RegexResult";

afterEach(cleanupAfterEach);

describe("RegexResult: segment & match count formatting", () => {
  it("renders matched and plain segments with correct classes", () => {
    const { container } = render(() => (
      <RegexResult
        matches={[{ text: "42" }]}
        segments={[
          { text: "number: ", matched: false },
          { text: "42", matched: true },
        ]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(container.querySelector(".match")).toHaveTextContent("42");
    expect(container.querySelector(".plain")).toHaveTextContent("number:");
  });

  it("shows match count with plural form", () => {
    render(() => (
      <RegexResult
        matches={[{ text: "a" }, { text: "b" }]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.getByText("2 matches")).toBeInTheDocument();
  });

  it("shows match count with singular form", () => {
    render(() => (
      <RegexResult
        matches={[{ text: "hello" }]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.getByText("1 match")).toBeInTheDocument();
  });

  it("shows zero matches", () => {
    render(() => (
      <RegexResult
        matches={[]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.getByText("0 matches")).toBeInTheDocument();
  });
});

describe("RegexResult: match lists and errors", () => {
  it("lists match texts when fewer than 6 matches", () => {
    render(() => (
      <RegexResult
        matches={[{ text: "foo" }, { text: "bar" }]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.getByText(/foo, bar/)).toBeInTheDocument();
  });

  it("does not list individual match texts when 6 or more matches", () => {
    const matches = Array.from({ length: 6 }, (_, i) => ({ text: `m${i}` }));
    render(() => (
      <RegexResult
        matches={matches}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.queryByText(/m0, m1/)).not.toBeInTheDocument();
  });

  it("displays error message when error is provided", () => {
    render(() => (
      <RegexResult
        matches={[]}
        segments={[]}
        error="Invalid pattern"
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.getByText("error: Invalid pattern")).toBeInTheDocument();
  });

  it("hides match count when error is present", () => {
    render(() => (
      <RegexResult
        matches={[]}
        segments={[]}
        error="some error"
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.queryByText("0 matches")).not.toBeInTheDocument();
  });

  it("shows dash placeholder when no segments are provided", () => {
    render(() => (
      <RegexResult
        matches={[]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("RegexResult: actions & status styles", () => {
  it("calls onresetflags when the reset button is clicked", async () => {
    const onresetflags = vi.fn();
    render(() => (
      <RegexResult
        matches={[]}
        segments={[]}
        error={null}
        onresetflags={onresetflags}
      />
    ));
    await fireEvent.click(screen.getByText("Reset Flags"));
    expect(onresetflags).toHaveBeenCalled();
  });

  it("applies tool-ok class when there are matches", () => {
    render(() => (
      <RegexResult
        matches={[{ text: "hit" }]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    const status = screen.getByRole("status");
    expect(status.querySelector(".tool-ok")).toBeInTheDocument();
  });

  it("does not apply tool-ok class when there are no matches", () => {
    render(() => (
      <RegexResult
        matches={[]}
        segments={[]}
        error={null}
        onresetflags={vi.fn()}
      />
    ));
    const status = screen.getByRole("status");
    expect(status.querySelector(".tool-ok")).toBeNull();
  });
});
