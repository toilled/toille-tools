import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import App from "../../src/App";

describe("Toille Tools App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders application title and navigation tabs", () => {
    const { getByRole, getByText, getAllByText } = render(() => <App />);

    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByText(/TOILLE TOOLS/i)).toBeInTheDocument();
    expect(getByText(/ALL TOOLS/i)).toBeInTheDocument();
    expect(getAllByText(/JSON Formatter/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Regex Tester/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Colour/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Edge/i).length).toBeGreaterThan(0);
    expect(getAllByText(/Base64/i).length).toBeGreaterThan(0);
  });

  it("switches tabs and filters active tools", async () => {
    const { getByRole, queryByLabelText, getByLabelText } = render(() => (
      <App />
    ));

    const jsonTab = getByRole("button", { name: /JSON Formatter/i });
    await fireEvent.click(jsonTab);

    expect(getByLabelText(/JSON Formatter/i)).toBeInTheDocument();
    expect(queryByLabelText(/Regex Tester/i)).not.toBeInTheDocument();
  });
});
