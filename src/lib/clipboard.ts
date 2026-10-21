/**
 * Copies text to the clipboard and temporarily triggers a copied key state.
 */
export async function copyToClipboard(
  text: string | null,
  key: string,
  setCopied: (k: string) => void,
): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  } catch {
    /* clipboard unavailable */
  }
}

/**
 * Copies text to the clipboard and triggers a temporary boolean copied state.
 */
export async function copyText(
  text: string | null,
  setCopied: (v: boolean) => void,
  durationMs = 1200,
): Promise<void> {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), durationMs);
  } catch {
    /* clipboard unavailable */
  }
}
