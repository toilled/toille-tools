import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyToClipboard, copyText } from "../../src/lib/clipboard";

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does nothing when text is null, undefined, or empty", async () => {
    const writeTextMock = vi.fn();
    vi.stubGlobal("navigator", {
      clipboard: { writeText: writeTextMock },
    });
    const setCopied = vi.fn();

    await copyToClipboard(null, "test-key", setCopied);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(setCopied).not.toHaveBeenCalled();

    await copyToClipboard("", "test-key", setCopied);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(setCopied).not.toHaveBeenCalled();
  });

  it("copies text and manages the copied state with a timeout", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: { writeText: writeTextMock },
    });
    const setCopied = vi.fn();

    const promise = copyToClipboard("hello world", "action-1", setCopied);
    await promise;

    expect(writeTextMock).toHaveBeenCalledWith("hello world");
    expect(setCopied).toHaveBeenCalledWith("action-1");

    vi.advanceTimersByTime(1199);
    expect(setCopied).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(setCopied).toHaveBeenCalledWith("");
    expect(setCopied).toHaveBeenCalledTimes(2);
  });

  it("gracefully catches errors when clipboard write fails", async () => {
    const writeTextMock = vi
      .fn()
      .mockRejectedValue(new Error("Permission denied"));
    vi.stubGlobal("navigator", {
      clipboard: { writeText: writeTextMock },
    });
    const setCopied = vi.fn();

    await expect(
      copyToClipboard("secret text", "fail-key", setCopied),
    ).resolves.toBeUndefined();
    expect(setCopied).not.toHaveBeenCalled();
  });
});

describe("copyText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does nothing when text is null, undefined, or empty", async () => {
    const writeTextMock = vi.fn();
    vi.stubGlobal("navigator", {
      clipboard: { writeText: writeTextMock },
    });
    const setCopied = vi.fn();

    await copyText(null, setCopied);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(setCopied).not.toHaveBeenCalled();

    await copyText("", setCopied);
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(setCopied).not.toHaveBeenCalled();
  });

  it("copies text and toggles boolean state with custom duration", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: { writeText: writeTextMock },
    });
    const setCopied = vi.fn();

    const promise = copyText("copied text", setCopied, 2000);
    await promise;

    expect(writeTextMock).toHaveBeenCalledWith("copied text");
    expect(setCopied).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(1999);
    expect(setCopied).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(setCopied).toHaveBeenCalledWith(false);
    expect(setCopied).toHaveBeenCalledTimes(2);
  });

  it("gracefully catches errors when clipboard write fails", async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error("Denied"));
    vi.stubGlobal("navigator", {
      clipboard: { writeText: writeTextMock },
    });
    const setCopied = vi.fn();

    await expect(copyText("secret text", setCopied)).resolves.toBeUndefined();
    expect(setCopied).not.toHaveBeenCalled();
  });
});
