export async function register() {
  if (typeof window === "undefined") {
    await import("../sentry.server.config");
  }
}
