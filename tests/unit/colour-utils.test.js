import { describe, it, expect } from "vitest";
import { parseColour } from "../../src/lib/colour-utils.js";

describe("colour-utils: empty & invalid inputs", () => {
  it("returns null for empty or whitespace strings", () => {
    expect(parseColour("")).toBeNull();
    expect(parseColour("   ")).toBeNull();
  });

  it("returns null for invalid colour formats", () => {
    expect(parseColour("invalid")).toBeNull();
    expect(parseColour("#12")).toBeNull();
    expect(parseColour("#12345")).toBeNull();
    expect(parseColour("#12345z")).toBeNull();
    expect(parseColour("#zzzzzz")).toBeNull();
    expect(parseColour("#ffffffffg")).toBeNull();
    expect(parseColour("rgb(255, 255)")).toBeNull();
    expect(parseColour("hsl(360, 100%)")).toBeNull();
    expect(parseColour("hsl(NaN, 100%, 50%)")).toBeNull();
    expect(parseColour("rgba(255, 255, 255, NaN)")).toBeNull();
  });
});

function getParsedHex(str) {
  const c = parseColour(str);
  return c ? c.hex : null;
}

function getParsedAlpha(str) {
  const c = parseColour(str);
  return c ? c.alpha : null;
}

function getParsedRgb(str) {
  const c = parseColour(str);
  return c ? c.rgb : null;
}

function getParsedBackground(str) {
  const c = parseColour(str);
  return c ? c.background : null;
}

describe("colour-utils: HEX parsing", () => {
  it("correctly parses valid hex colours", () => {
    expect(getParsedHex("#fff")).toBe("#FFFFFF");
    expect(getParsedHex("#ffffff")).toBe("#FFFFFF");
    expect(getParsedHex("#000000")).toBe("#000000");
    expect(getParsedHex("#FF5733")).toBe("#FF5733");
    expect(getParsedHex("#ff5733")).toBe("#FF5733");
  });

  it("parses 4-character hex with alpha (#RGBA)", () => {
    expect(getParsedHex("#f0f8")).toBe("#FF00FF");
    expect(getParsedAlpha("#f0f8")).toBe("0.53");
    expect(getParsedHex("#fff0")).toBe("#FFFFFF");
    expect(getParsedAlpha("#fff0")).toBe("0");
  });

  it("parses 8-character hex with alpha (#RRGGBBAA)", () => {
    expect(getParsedHex("#ff00ff80")).toBe("#FF00FF");
    expect(getParsedAlpha("#ff00ff80")).toBe("0.5");
    expect(getParsedHex("#000000ff")).toBe("#000000");
    expect(getParsedAlpha("#000000ff")).toBe("1");
  });
});

describe("colour-utils: RGB / RGBA parsing", () => {
  it("correctly parses valid rgb/rgba colours", () => {
    expect(getParsedRgb("rgb(255, 0, 0)")).toBe("rgb(255, 0, 0)");
    expect(getParsedHex("rgb(255, 0, 0)")).toBe("#FF0000");
    expect(getParsedRgb("rgba(0, 255, 0, 0.5)")).toBe("rgb(0, 255, 0)");
    expect(getParsedAlpha("rgba(0, 255, 0, 0.5)")).toBe("0.5");
    expect(getParsedRgb("rgba(0, 0, 255, 50%)")).toBe("rgb(0, 0, 255)");
    expect(getParsedAlpha("rgba(0, 0, 255, 50%)")).toBe("0.5");
    expect(getParsedRgb("rgb(300, 200, 255)")).toBe("rgb(255, 200, 255)");
  });

  it("handles alpha in background property and edge-case values", () => {
    expect(getParsedBackground("rgba(255, 255, 255, 1)")).toBe("#FFFFFF");
    expect(getParsedBackground("rgba(255, 255, 255, 0.5)")).toBe(
      "rgba(255, 255, 255, 0.5)",
    );
    expect(getParsedHex("rgb(0, 0, 0)")).toBe("#000000");
    expect(getParsedHex("rgb(255, 255, 255)")).toBe("#FFFFFF");
    expect(getParsedRgb("rgb(255 128 0 / 0.75)")).toBe("rgb(255, 128, 0)");
    expect(getParsedAlpha("rgb(255 128 0 / 0.75)")).toBe("0.75");
  });
});

describe("colour-utils: HSL / HSLA parsing", () => {
  it("correctly parses valid hsl/hsla colours", () => {
    expect(getParsedHex("hsl(0, 100%, 50%)")).toBe("#FF0000");
    expect(getParsedHex("hsla(120, 100%, 50%, 0.5)")).toBe("#00FF00");
    expect(getParsedAlpha("hsla(120, 100%, 50%, 0.5)")).toBe("0.5");
    expect(getParsedHex("hsla(240, 100%, 50%, 50%)")).toBe("#0000FF");
    expect(getParsedAlpha("hsla(240, 100%, 50%, 50%)")).toBe("0.5");
  });

  it("handles hue boundaries, wrapping and saturation edge cases", () => {
    expect(parseColour("hsl(-30, 100%, 50%)")).toBeNull();
    expect(getParsedHex("hsl(390, 100%, 50%)")).toBe(
      getParsedHex("hsl(30, 100%, 50%)"),
    );
    expect(getParsedHex("hsl(60, 100%, 50%)")).toBe("#FFFF00");
    expect(getParsedHex("hsl(120, 100%, 50%)")).toBe("#00FF00");
    expect(getParsedHex("hsl(180, 100%, 50%)")).toBe("#00FFFF");
    expect(getParsedHex("hsl(240, 100%, 50%)")).toBe("#0000FF");
    expect(getParsedHex("hsl(300, 100%, 50%)")).toBe("#FF00FF");
    expect(getParsedHex("hsl(0, 0%, 0%)")).toBe("#000000");
    expect(getParsedHex("hsl(0, 0%, 100%)")).toBe("#FFFFFF");
    expect(getParsedHex("hsl(0, 0%, 50%)")).toBe("#808080");
    expect(parseColour("hsl(NaN, 50%, 50%)")).toBeNull();
  });
});
