import { EzoicPlaceholder } from "@/components/ads/ezoic-placeholder";
import type { WidgetPlugin } from "./types";

// Placeholder IDs must match those created in the Ezoic dashboard.
// Each repeated instance uses a unique ID (101, 102, 103, ...) to avoid
// "unpredictable ad behaviour" per Ezoic infinite scroll docs.
const EZOIC_FEED_BASE_ID = 101;

export const ezoicWidget: WidgetPlugin = {
  id: "ezoic",
  name: "Ezoic Ads",
  prompts: [
    {
      id: "ezoic-feed-ad",
      slug: "ezoic-feed-ad",
      title: "",
      description: "",
      content: "",
      type: "TEXT",
      positioning: {
        position: 4,
        mode: "repeat",
        repeatEvery: 12,
        maxCount: 20,
      },
      shouldInject: () => process.env.NEXT_PUBLIC_EZOIC_ENABLED === "true",
      render: (instanceIndex: number) => (
        <EzoicPlaceholder id={EZOIC_FEED_BASE_ID + instanceIndex} />
      ),
    },
  ],
};
