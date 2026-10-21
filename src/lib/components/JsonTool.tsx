import ToolOutput from "./ToolOutput";
import ToolMeta from "./ToolMeta";
import { useTextToolState } from "./useTextToolState";

const SAMPLE = `{"name":"Elliot","role":"Senior Web Developer","stack":["PHP","JavaScript","SQL","Laravel","Docker"],"years":14}`;

function formatJsonError(msg: string, input: string): string {
  const match = /position (\d+)/.exec(msg);
  if (!match) return msg;
  const pos = Number(match[1]);
  const upTo = input.slice(0, pos);
  const line = upTo.split("\n").length;
  const lastNewline = upTo.lastIndexOf("\n");
  const column = pos - lastNewline;
  return `JSON error at line ${line}, column ${column} — ${msg}`;
}

export default function JsonTool() {
  const { input, setInput, output, setOutput, status, setStatus, reset } =
    useTextToolState();

  function apply(transform: (value: unknown) => string) {
    const val = input().trim();
    if (!val) {
      setStatus("error: nothing to process");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(val);
      setOutput(transform(parsed));
      setStatus("valid JSON");
    } catch (error) {
      setOutput("");
      setStatus(`error: ${formatJsonError((error as Error).message, input())}`);
    }
  }

  return (
    <>
      <div class="tool-grid">
        <div class="tool-field">
          <label for="json-input">Input JSON</label>
          <textarea
            id="json-input"
            class="tool-input"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            placeholder="paste JSON to format"
          />
          <div class="tool-actions">
            <button
              type="button"
              class="tool-btn"
              onClick={() => apply((v) => JSON.stringify(v, null, 2))}
            >
              Format
            </button>
            <button
              type="button"
              class="tool-btn"
              onClick={() => apply((v) => JSON.stringify(v))}
            >
              Minify
            </button>
            <button
              type="button"
              class="tool-btn"
              onClick={() =>
                apply(
                  (v) =>
                    `${Object.prototype.toString.call(v)} — ${input().trim().length} chars`,
                )
              }
            >
              Validate
            </button>
            <button
              type="button"
              class="tool-btn"
              onClick={() => reset(SAMPLE)}
            >
              Load Sample
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
        </div>

        <ToolOutput
          id="json-output"
          value={output()}
          placeholder="Result appears here"
        />
      </div>

      <ToolMeta
        status={status()}
        fallback="// format · minify · validate — all processing happens locally"
      />
    </>
  );
}
