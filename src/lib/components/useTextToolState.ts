import { createSignal } from "solid-js";

export function useTextToolState(initial = "") {
  const [input, setInput] = createSignal(initial);
  const [output, setOutput] = createSignal("");
  const [status, setStatus] = createSignal("");

  function reset(sample = "") {
    setInput(sample);
    setOutput("");
    setStatus("");
  }

  return {
    input,
    setInput,
    output,
    setOutput,
    status,
    setStatus,
    reset,
  };
}
