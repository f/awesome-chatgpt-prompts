import { EzoicPlaceholder } from "@/components/ads/ezoic-placeholder";
import type { WidgetPlugin } from "./types";

// Placeholder IDs must match those created in the Ezoic dashboard.
// Using a range of IDs to support repeat mode with unique placeholders.
const EZOIC_FEED_PLACEHOLDER_ID = 101;

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
        maxCount: 5,
      },
      shouldInject: () => true,
      render: () => <EzoicPlaceholder id={EZOIC_FEED_PLACEHOLDER_ID} />,
    },
  ],
};
