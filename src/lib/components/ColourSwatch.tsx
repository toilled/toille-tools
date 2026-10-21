import { For, Show } from "solid-js";
import "./ColourSwatch.css";
import type { ParsedColour } from "$lib/colour-utils";

export type ColourResult = ParsedColour;

interface Props {
  result: ColourResult | null;
  copied: string | null;
  oncopy: (value: string, key: string) => void;
}

const ROWS: Array<{ key: "hex" | "rgb" | "hsl"; label: string }> = [
  { key: "hex", label: "HEX" },
  { key: "rgb", label: "RGB" },
  { key: "hsl", label: "HSL" },
];

export default function ColourSwatch(props: Props) {
  return (
    <>
      <div class="tool-field">
        <p class="tool-sub-label">Preview</p>
        <div
          class="swatch"
          role="img"
          aria-label="Colour preview"
          style={{ background: props.result?.background ?? "transparent" }}
        />
      </div>

      <div class="tool-field">
        <p class="tool-sub-label">Values</p>
        <div class="swatch-values mono">
          <Show when={props.result} fallback={<p class="dim">—</p>}>
            {(res) => (
              <>
                <For each={ROWS}>
                  {(row) => (
                    <div class="swatch-row">
                      <span class="dim">{row.label}</span>
                      <code>{res()[row.key]}</code>
                      <button
                        type="button"
                        class="tool-btn"
                        aria-label={`Copy ${row.label} value`}
                        onClick={() => props.oncopy(res()[row.key], row.key)}
                      >
                        {props.copied === row.key ? "✓" : "copy"}
                      </button>
                    </div>
                  )}
                </For>
                <div class="swatch-row">
                  <span class="dim">ALPHA</span>
                  <code>{res().alpha}</code>
                </div>
              </>
            )}
          </Show>
        </div>
      </div>
    </>
  );
}
