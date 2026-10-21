import { Show } from "solid-js";
import type { JSX } from "@solidjs/web";

interface Props {
  status: string;
  fallback: string | JSX.Element;
}

export default function ToolMeta(props: Props) {
  const isErr = () => props.status.startsWith("error:");
  const isOk = () =>
    !isErr() &&
    (props.status.includes("✓") ||
      props.status === "valid JSON" ||
      props.status.startsWith("encoded"));

  return (
    <p class="tool-meta" role="status" aria-live="polite">
      <Show
        when={props.status}
        fallback={<span class="dim">{props.fallback}</span>}
      >
        <span class={isErr() ? "tool-err" : isOk() ? "tool-ok" : ""}>
          {props.status}
        </span>
      </Show>
    </p>
  );
}
