import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import Base64Tool from "../../src/lib/components/Base64Tool";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Base64Tool", () => {
  it("encodes and decodes UTF-8 strings to/from Base64", async () => {
    render(() => <Base64Tool />);
    const input = screen.getByLabelText(/Input text or Base64/);
    const output = screen.getByLabelText("Output") as HTMLTextAreaElement;

    await fireEvent.input(input, { target: { value: "Hello World!" } });
    await fireEvent.click(
      screen.getByRole("button", { name: "Base64 Encode" }),
    );
    expect(output.value).toBe("SGVsbG8gV29ybGQh");

    await fireEvent.input(input, { target: { value: "SGVsbG8gV29ybGQh" } });
    await fireEvent.click(
      screen.getByRole("button", { name: "Base64 Decode" }),
    );
    expect(output.value).toBe("Hello World!");
  });

  it("performs URL encoding and decoding", async () => {
    render(() => <Base64Tool />);
    const input = screen.getByLabelText(/Input text or Base64/);
    const output = screen.getByLabelText("Output") as HTMLTextAreaElement;

    await fireEvent.input(input, {
      target: { value: "foo=bar&baz=hello world" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "URL Encode" }));
    expect(output.value).toBe("foo%3Dbar%26baz%3Dhello%20world");

    await fireEvent.input(input, {
      target: { value: "foo%3Dbar%26baz%3Dhello%20world" },
    });
    await fireEvent.click(screen.getByRole("button", { name: "URL Decode" }));
    expect(output.value).toBe("foo=bar&baz=hello world");
  });
});
