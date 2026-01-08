// ============================================
// Widgets Plugin Types
// ============================================

export interface WidgetContext {
  filters?: {
    q?: string;
    type?: string;
    category?: string;
    categorySlug?: string;
    tag?: string;
    sort?: string;
  };
  page?: number;
  itemCount?: number;
}

export interface WidgetPrompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  type: "TEXT" | "STRUCTURED";
  structuredFormat?: "json" | "yaml";
  sponsor?: {
    name: string;
    logo: string;
    logoDark?: string;
    url: string;
  };
  tags?: string[];
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
  position?: number;
  shouldInject?: (context: WidgetContext) => boolean;
}

export interface InjectedWidget extends WidgetPrompt {
  isWidget: true;
}

export interface WidgetPlugin {
  id: string;
  name: string;
  prompts: WidgetPrompt[];
}

/**
 * Type guard to check if an item is a widget prompt
 */
export function isWidget(item: unknown): item is InjectedWidget {
  return typeof item === "object" && item !== null && "isWidget" in item && (item as InjectedWidget).isWidget === true;
}
