type FieldValue = string | number | boolean | null | undefined | readonly string[];

/**
 * Whether a form holds work that leaving the page would throw away.
 *
 * Compares what the form started with against what it holds now, ignoring changes that
 * don't change meaning: surrounding spaces, empty versus missing, and the order of a list
 * (Tags, Storytellers). `scratch` is text typed outside the fields, such as a pasted Gemini
 * reply not yet applied; any of it counts as work.
 */
export function hasUnsavedChanges<T extends Record<string, FieldValue>>(saved: T, current: T, scratch = ""): boolean {
  if (scratch.trim()) return true;
  const keys = new Set([...Object.keys(saved), ...Object.keys(current)]);
  for (const key of keys) {
    if (normalise(saved[key]) !== normalise(current[key])) return true;
  }
  return false;
}

function normalise(value: FieldValue): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return JSON.stringify(value.map((v) => v.trim()).filter(Boolean).sort());
  }
  return String(value).trim();
}
