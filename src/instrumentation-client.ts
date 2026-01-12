// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Patterns to ignore - typically from browser extensions or third-party scripts
const ignoreErrors = [
  // Browser extension errors
  /MetaMask/i,
  /ethereum/i,
  /tronlink/i,
  /tron/i,
  /webkit\.messageHandlers/i,
  /disconnected port/i,
  /__firefox__/i,
  // DOM manipulation errors often caused by extensions
  /removeChild.*not a child/i,
  /parentNode.*null/i,
  // Third-party/extension scripts
  /CONFIG.*not defined/i,
  /Can't find variable: CONFIG/i,
];

Sentry.init({
  dsn: "https://9c2eb3b4441745efad28a908001c30bf@o4510673866063872.ingest.de.sentry.io/4510673871306832",

  // Disable Sentry in development
  enabled: process.env.NODE_ENV === "production",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Filter out browser extension and third-party script errors
  beforeSend(event) {
    const message = event.exception?.values?.[0]?.value || "";
    const type = event.exception?.values?.[0]?.type || "";
    const fullMessage = `${type}: ${message}`;

    // Check if error matches any ignore pattern
    if (ignoreErrors.some((pattern) => pattern.test(fullMessage))) {
      return null;
    }

    // Filter out errors from browser extension scripts
    const frames = event.exception?.values?.[0]?.stacktrace?.frames || [];
    const hasExtensionFrame = frames.some((frame) => {
      const filename = frame.filename || "";
      return (
        filename.includes("extension://") ||
        filename.includes("moz-extension://") ||
        filename.includes("chrome-extension://")
      );
    });

    if (hasExtensionFrame) {
      return null;
    }

    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
