import ToolOutput from "./ToolOutput";
import ToolMeta from "./ToolMeta";
import { useTextToolState } from "./useTextToolState";

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const clean = b64.trim().replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

type Base64Action = "encode" | "decode" | "url-encode" | "url-decode";

interface ActionResult {
  output: string;
  status: string;
}

const ACTION_HANDLERS: Record<Base64Action, (val: string) => ActionResult> = {
  encode: (val) => {
    const res = toBase64(val);
    return { output: res, status: `encoded (${res.length} chars)` };
  },
  decode: (val) => ({
    output: fromBase64(val),
    status: "decoded successfully ✓",
  }),
  "url-encode": (val) => ({
    output: encodeURIComponent(val),
    status: "URL encoded ✓",
  }),
  "url-decode": (val) => ({
    output: decodeURIComponent(val),
    status: "URL decoded ✓",
  }),
};

function executeTransform(action: Base64Action, val: string): ActionResult {
  return ACTION_HANDLERS[action](val);
}

export default function Base64Tool() {
  const { input, setInput, output, setOutput, status, setStatus, reset } =
    useTextToolState();

  function process(action: Base64Action) {
    const val = input();
    if (!val.trim()) {
      setOutput("");
      setStatus("error: nothing to process");
      return;
    }

    try {
      const res = executeTransform(action, val);
      setOutput(res.output);
      setStatus(res.status);
    } catch (err) {
      setOutput("");
      setStatus(`error: ${(err as Error).message}`);
    }
  }

  return (
    <>
      <div class="tool-field">
        <label for="b64-input">Input text or Base64 / URL string</label>
        <textarea
          id="b64-input"
          class="tool-input"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder="Type or paste text to encode or decode…"
        />
      </div>

      <div class="tool-actions">
        <button
          type="button"
          class="tool-btn"
          onClick={() => process("encode")}
        >
          Base64 Encode
        </button>
        <button
          type="button"
          class="tool-btn"
          onClick={() => process("decode")}
        >
          Base64 Decode
        </button>
        <button
          type="button"
          class="tool-btn"
          onClick={() => process("url-encode")}
        >
          URL Encode
        </button>
        <button
          type="button"
          class="tool-btn"
          onClick={() => process("url-decode")}
        >
          URL Decode
        </button>
        <button
          type="button"
          class="tool-btn"
          onClick={() => reset("Hello, Cyberpunk World! 🚀")}
        >
          Sample
        </button>
        <button
          type="button"
          class="tool-btn"
          onClick={() => reset()}
          disabled={!input()}
        >
          Clear
        </button>
      </div>

      <ToolOutput
        id="b64-output"
        value={output()}
        placeholder="Result appears here"
      />

      <ToolMeta
        status={status()}
        fallback="// UTF-8 safe Base64 and URL encoding/decoding — runs locally"
      />
    </>
  );
}
