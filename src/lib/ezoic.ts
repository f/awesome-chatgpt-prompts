/**
 * Safely push a function to the Ezoic command queue.
 * Initializes window.ezstandalone and cmd array if they don't exist yet,
 * preventing errors when components mount before the Ezoic script loads.
 *
 * @see https://docs.ezoic.com/docs/ezoicadsadvanced/nextjs/
 */
export function runEzoic(fn: () => void) {
  if (typeof window === "undefined") return;
  const ez = (window.ezstandalone ??= {} as NonNullable<typeof window.ezstandalone>);
  ez.cmd = ez.cmd || [];
  ez.cmd.push(fn);
}
