import { createSignal, createMemo, Show } from "solid-js";
import { parseColour } from "$lib/colour-utils";
import { copyToClipboard } from "$lib/clipboard";
import ColourSwatch, { type ColourResult } from "./ColourSwatch";

export default function ColourTool() {
  const [value, setValue] = createSignal("#00ffcc");
  const [copied, setCopied] = createSignal("");

  const result = createMemo<ColourResult | null>(() => parseColour(value()));
  const error = createMemo(() => {
    const val = value();
    const parsed = result();
    return parsed ? "" : val.trim() ? "unrecognised colour format" : "";
  });
  const colourPickerValue = createMemo(() => result()?.hex ?? "#00ffcc");

  return (
    <>
      <div class="tool-field">
        <label for="colour-value">Colour</label>
        <div class="tool-inline">
          <input
            id="colour-value"
            type="text"
            value={value()}
            onInput={(e) => {
              setValue(e.currentTarget.value);
              setCopied("");
            }}
            placeholder="#00ffcc / rgb() / hsl()"
          />
          <input
            type="color"
            aria-label="Open colour picker"
            value={colourPickerValue()}
            onInput={(e) => {
              setValue(e.currentTarget.value);
              setCopied("");
            }}
            class="swatch-color-picker"
          />
        </div>
      </div>

      <div class="tool-grid">
        <ColourSwatch
          result={result()}
          copied={copied()}
          oncopy={(val, key) => void copyToClipboard(val, key, setCopied)}
        />
      </div>

      <p class="tool-meta" role="status" aria-live="polite">
        <Show
          when={!error()}
          fallback={<span class="tool-err">error: {error()}</span>}
        >
          <Show when={result()}>
            <span class="tool-ok">parsed ✓</span>
            <span class="dim"> — accepts #hex, rgb() and hsl()</span>
          </Show>
        </Show>
      </p>
    </>
  );
}
