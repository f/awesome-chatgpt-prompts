/**
 * Safely push a function to the Ezoic command queue.
 * Initializes window.ezstandalone and cmd array if they don't exist yet,
 * preventing errors when components mount before the Ezoic script loads.
 */
export function runEzoic(fn: () => void) {
  if (typeof window === "undefined") return;
  if (!window.ezstandalone) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ezstandalone = { cmd: [] };
  }
  if (!window.ezstandalone!.cmd) {
    window.ezstandalone!.cmd = [];
  }
  window.ezstandalone!.cmd.push(fn);
}
