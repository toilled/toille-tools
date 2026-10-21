import { For, Show } from "solid-js";
import "./RegexResult.css";

export interface Segment {
  text: string;
  matched: boolean;
}

interface MatchItem {
  text: string;
}

interface Props {
  matches: MatchItem[];
  segments: Segment[];
  error: string | null;
  onresetflags: () => void;
}

export default function RegexResult(props: Props) {
  return (
    <>
      <div class="tool-field">
        <p class="tool-sub-label">Matches</p>
        <pre
          class="tool-output"
          aria-label="Highlighted matches"
          aria-live="polite"
        >
          <Show when={props.segments.length > 0} fallback="—">
            <code>
              <For each={props.segments}>
                {(seg) => (
                  <span class={seg.matched ? "match" : "plain"}>
                    {seg.text}
                  </span>
                )}
              </For>
            </code>
          </Show>
        </pre>
        <div class="tool-actions">
          <button
            type="button"
            class="tool-btn"
            onClick={() => props.onresetflags()}
          >
            Reset Flags
          </button>
        </div>
      </div>

      <p class="tool-meta" role="status" aria-live="polite">
        <Show
          when={!props.error}
          fallback={<span class="tool-err">error: {props.error}</span>}
        >
          <span class={props.matches.length > 0 ? "tool-ok" : ""}>
            {props.matches.length === 0
              ? "0 matches"
              : `${props.matches.length} match${props.matches.length === 1 ? "" : "es"}`}
            <span class="dim">
              <Show when={props.matches.length > 0 && props.matches.length < 6}>
                {" "}
                — {props.matches.map((m) => m.text).join(", ")}
              </Show>
            </span>
          </span>
        </Show>
      </p>
    </>
  );
}
