// fallow-ignore-file security-sink -- the compiled RegExp is built from the user's own pattern and only used for local matching; no eval, no network, no privileged sink
import { createSignal, createMemo } from "solid-js";
import RegexResult, { type Segment } from "./RegexResult";

interface MatchItem {
  text: string;
  index: number;
}

const MAX_MATCHES = 5000;
const MAX_EXEC_TIME_MS = 150;

function hasCatastrophicNesting(pattern: string): boolean {
  // Flag patterns with nested repetition like (a+)+, (.*)*, ([0-9]+)*
  return (
    /\([^()]+[+*]\)[+*]/.test(pattern) || /\(\?:[^()]+[+*]\)[+*]/.test(pattern)
  );
}

function isTimeoutExceeded(startTime: number, step: number): boolean {
  if (step % 100 !== 0) return false;
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  return now - startTime > MAX_EXEC_TIME_MS;
}

function advanceEmptyMatch(matchText: string, re: RegExp): void {
  if (matchText === "") {
    re.lastIndex += 1;
  }
}

function isMatchIterationComplete(
  matchCount: number,
  lastIndex: number,
  strLen: number,
): boolean {
  return matchCount >= MAX_MATCHES || lastIndex > strLen;
}

function processMatchStep(
  re: RegExp,
  match: RegExpExecArray,
  str: string,
  matches: MatchItem[],
  startTime: number,
  step: number,
): { shouldBreak: boolean; timedOut: boolean } {
  matches.push({ text: match[0], index: match.index });
  advanceEmptyMatch(match[0], re);
  if (isMatchIterationComplete(matches.length, re.lastIndex, str.length)) {
    return { shouldBreak: true, timedOut: false };
  }
  if (isTimeoutExceeded(startTime, step)) {
    return { shouldBreak: true, timedOut: true };
  }
  return { shouldBreak: false, timedOut: false };
}

function collectMatches(
  re: RegExp,
  str: string,
): { matches: MatchItem[]; timedOut: boolean } {
  const matches: MatchItem[] = [];
  let match: RegExpExecArray | null;
  const startTime =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  let step = 0;

  while ((match = re.exec(str)) !== null) {
    step++;
    const res = processMatchStep(re, match, str, matches, startTime, step);
    if (res.shouldBreak) {
      return { matches, timedOut: res.timedOut };
    }
  }
  return { matches, timedOut: false };
}

function buildSegments(str: string, matches: MatchItem[]): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;
  for (const { text, index } of matches) {
    if (index > pos)
      segments.push({ text: str.slice(pos, index), matched: false });
    segments.push({ text, matched: true });
    pos = index + text.length;
  }
  if (pos < str.length) segments.push({ text: str.slice(pos), matched: false });
  return segments;
}

const MAX_PATTERN_LENGTH = 1000;
const MAX_TEST_STRING_LENGTH = 100_000;

function validateRegexInput(
  pat: string,
  str: string,
): {
  error: string;
  matches: [];
  segments: { text: string; matched: boolean }[];
} | null {
  if (pat.length > MAX_PATTERN_LENGTH) {
    return {
      error: `Pattern exceeds maximum length of ${MAX_PATTERN_LENGTH} characters.`,
      matches: [],
      segments: [],
    };
  }
  if (str.length > MAX_TEST_STRING_LENGTH) {
    return {
      error: `Test string exceeds maximum length of ${MAX_TEST_STRING_LENGTH} characters.`,
      matches: [],
      segments: [],
    };
  }
  if (hasCatastrophicNesting(pat) && str.length > 2000) {
    return {
      error:
        "Pattern contains nested quantifiers with high catastrophic backtracking risk on large input.",
      matches: [],
      segments: [{ text: str, matched: false }],
    };
  }
  return null;
}

function resolveRegexFlags(rawFlags: string): string {
  const sanitized = Array.from(
    new Set(rawFlags.replace(/[^dgimsuy]/gi, "").toLowerCase()),
  ).join("");
  return sanitized.includes("g") ? sanitized : `${sanitized}g`;
}

function createEmptyRegexResult(str: string) {
  const segments = str ? [{ text: str, matched: false }] : [];
  return { error: "", matches: [], segments };
}

function executeRegexMatch(pat: string, rawFlags: string, str: string) {
  try {
    const re = new RegExp(pat, resolveRegexFlags(rawFlags));
    const result = collectMatches(re, str);
    const segments = buildSegments(str, result.matches);
    if (result.timedOut) {
      return {
        error: `Regex execution exceeded ${MAX_EXEC_TIME_MS}ms budget and was stopped.`,
        matches: result.matches,
        segments,
      };
    }
    return { error: "", matches: result.matches, segments };
  } catch (cause) {
    return { error: (cause as Error).message, matches: [], segments: [] };
  }
}

function evaluateRegex(pat: string, rawFlags: string, str: string) {
  if (!pat || !str) return createEmptyRegexResult(str);
  const invalid = validateRegexInput(pat, str);
  if (invalid) return invalid;
  return executeRegexMatch(pat, rawFlags, str);
}

export default function RegexTool() {
  const [pattern, setPattern] = createSignal("");
  const [flags, setFlags] = createSignal("gi");
  const [test, setTest] = createSignal("");

  const result = createMemo(() => evaluateRegex(pattern(), flags(), test()));

  return (
    <>
      <div class="tool-field">
        <label for="regex-pattern">Pattern</label>
        <input
          id="regex-pattern"
          type="text"
          value={pattern()}
          onInput={(e) => setPattern(e.currentTarget.value)}
          placeholder="e.g. \\d+ or [a-z]+"
        />
      </div>

      <div class="tool-field">
        <label for="regex-flags">Flags</label>
        <input
          id="regex-flags"
          type="text"
          value={flags()}
          onInput={(e) => setFlags(e.currentTarget.value)}
          placeholder="g i m s u"
          maxlength={8}
        />
      </div>

      <div class="tool-field">
        <label for="regex-test">Test string</label>
        <textarea
          id="regex-test"
          class="tool-input"
          value={test()}
          onInput={(e) => setTest(e.currentTarget.value)}
          placeholder="Text to match against…"
        />
      </div>

      <RegexResult
        matches={result().matches}
        segments={result().segments}
        error={result().error}
        onresetflags={() => setFlags("g")}
      />
    </>
  );
}
