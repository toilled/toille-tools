import { createSignal, createEffect } from "solid-js";
import { copyText } from "$lib/clipboard";

interface Props {
  value?: string;
  id: string;
  placeholder?: string;
  class?: string;
}

function computeTextareaClass(customClass?: string): string {
  if (customClass) return `tool-input tool-output ${customClass}`;
  return "tool-input tool-output";
}

function computeCopyLabel(copied: boolean): string {
  if (copied) return "Copied to clipboard";
  return "Copy result";
}

function computeButtonText(copied: boolean): string {
  if (copied) return "Copied ✓";
  return "Copy";
}

export default function ToolOutput(props: Props) {
  const [copied, setCopied] = createSignal(false);
  let textareaEl: HTMLTextAreaElement | undefined;

  createEffect(
    () => props.value,
    (val) => {
      if (textareaEl) {
        textareaEl.value = val || "";
      }
    },
  );

  function copy() {
    void copyText(
      props.value !== undefined ? props.value : null,
      setCopied,
      1200,
    );
  }

  const outputValue = () => props.value || "";
  const placeholderText = () => props.placeholder || "Result appears here";

  return (
    <div class="tool-field">
      <label for={props.id}>Output</label>
      <textarea
        ref={(el) => (textareaEl = el)}
        id={props.id}
        class={computeTextareaClass(props.class)}
        readonly
        value={outputValue()}
        placeholder={placeholderText()}
      />
      <div class="tool-actions">
        <button
          type="button"
          class={["tool-btn", { "tool-btn-copied": copied() }]}
          onClick={copy}
          disabled={!props.value}
          aria-label={computeCopyLabel(copied())}
        >
          {computeButtonText(copied())}
        </button>
        <span class="sr-only" role="status" aria-live="polite">
          {copied() ? "Output copied to clipboard" : ""}
        </span>
      </div>
    </div>
  );
}
