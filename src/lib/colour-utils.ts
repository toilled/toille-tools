export interface ParsedColour {
  hex: string;
  rgb: string;
  hsl: string;
  alpha: string;
  background: string;
}

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Clamp a number between min and max. */
function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

const HEX_TABLE = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0").toUpperCase(),
);

/** Convert a 0-255 value to a two-digit uppercase hex string. */
function toHex2(v: number): string {
  const n = clamp(Math.round(v), 0, 255);
  return HEX_TABLE[n];
}

/** Convert RGB channels to a hex colour string. */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

function computeHue(
  r: number,
  g: number,
  b: number,
  max: number,
  d: number,
): number {
  if (max === r) {
    const offset = g < b ? 6 : 0;
    return ((g - b) / d + offset) / 6;
  }
  if (max === g) {
    return ((b - r) / d + 2) / 6;
  }
  return ((r - g) / d + 4) / 6;
}

function computeSaturation(
  d: number,
  l: number,
  max: number,
  min: number,
): number {
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

/** Convert RGB to HSL. */
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }
  const d = max - min;
  const s = computeSaturation(d, l, max, min);
  const h = computeHue(normR, normG, normB, max, d);
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function areFiniteHsl(h: number, s: number, l: number): boolean {
  return Number.isFinite(h) && Number.isFinite(s) && Number.isFinite(l);
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  if (!areFiniteHsl(h, s, l)) return { r: 0, g: 0, b: 0 };
  const normH = ((h % 360) + 360) % 360;
  const sClamped = clamp(s / 100, 0, 1);
  const lClamped = clamp(l / 100, 0, 1);
  const c = (1 - Math.abs(2 * lClamped - 1)) * sClamped;
  const x = c * (1 - Math.abs(((normH / 60) % 2) - 1));
  const m = lClamped - c / 2;
  const sector = Math.floor(normH / 60) % 6;
  const lut: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = lut[sector] ?? [0, 0, 0];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function expandShortHex(hex: string): string {
  if (hex.length === 3) {
    return `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  if (hex.length === 4) {
    return `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

function isValidHexDigits(hex: string): boolean {
  const isLen = hex.length === 6 || hex.length === 8;
  return isLen && /^[0-9a-fA-F]+$/.test(hex);
}

function extractHexAlpha(hex: string): number {
  return hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
}

/** Parse a hex colour string into RGBA components. */
function parseHex(s: string): Rgba | null {
  const raw = s.trim().replace(/^#/, "");
  const hex = expandShortHex(raw);
  if (!isValidHexDigits(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    a: extractHexAlpha(hex),
  };
}

/** Extract alpha from a CSS colour alpha component. */
function alphaFrom(match: string | undefined): number {
  if (match === undefined) return 1;
  return match.endsWith("%") ? Number(match.slice(0, -1)) / 100 : Number(match);
}

function hasNanChannel(r: number, g: number, b: number, a: number): boolean {
  return (
    Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)
  );
}

/** Parse an rgb()/rgba() colour string. */
function parseRgb(s: string): Rgba | null {
  const m = s.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i,
  );
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const a = alphaFrom(m[4]);
  if (hasNanChannel(r, g, b, a)) return null;
  return { r, g, b, a };
}

function hasNanHsl(h: number, s: number, l: number): boolean {
  return Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l);
}

/** Parse an hsl()/hsla() colour string. */
function parseHsl(s: string): Rgba | null {
  const m = s.match(
    /hsla?\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%(?:[,\s/]+([\d.]+%?))?\s*\)/i,
  );
  if (!m) return null;
  const h = Number(m[1]);
  const sVal = Number(m[2]);
  const l = Number(m[3]);
  if (hasNanHsl(h, sVal, l)) return null;
  const a = alphaFrom(m[4]);
  if (Number.isNaN(a)) return null;
  const { r, g, b } = hslToRgb(h, sVal, l);
  return { r, g, b, a };
}

function resolveColourParts(value: string): Rgba | null {
  const hex = parseHex(value);
  if (hex) return hex;
  const rgb = parseRgb(value);
  if (rgb) return rgb;
  return parseHsl(value);
}

function formatAlpha(a: number): string {
  return a >= 1 ? "1" : String(Number(a.toFixed(2)));
}

function formatBackground(
  r: number,
  g: number,
  b: number,
  a: number,
  alphaStr: string,
): string {
  return a >= 1 ? rgbToHex(r, g, b) : `rgba(${r}, ${g}, ${b}, ${alphaStr})`;
}

/** Parse any CSS colour string (hex, rgb, hsl) into a normalised result. */
export function parseColour(value: string): ParsedColour | null {
  if (!value.trim()) return null;
  const parts = resolveColourParts(value);
  if (!parts) return null;
  const r = clamp(parts.r, 0, 255);
  const g = clamp(parts.g, 0, 255);
  const b = clamp(parts.b, 0, 255);
  const hsl = rgbToHsl(r, g, b);
  const alpha = formatAlpha(parts.a);
  const background = formatBackground(r, g, b, parts.a, alpha);
  return {
    hex: rgbToHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    alpha,
    background,
  };
}
