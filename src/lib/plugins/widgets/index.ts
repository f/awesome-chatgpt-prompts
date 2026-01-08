import type { WidgetPlugin, WidgetPrompt, WidgetContext } from "./types";
import { coderabbitWidget } from "./coderabbit";

export * from "./types";

// Registry of all widget plugins
const widgetPlugins: WidgetPlugin[] = [
  coderabbitWidget,
];

/**
 * Get all registered widget plugins
 */
export function getWidgetPlugins(): WidgetPlugin[] {
  return widgetPlugins;
}

/**
 * Get all widget prompts
 */
export function getWidgetPrompts(): WidgetPrompt[] {
  return widgetPlugins.flatMap((plugin) => plugin.prompts);
}

/**
 * Get a specific widget plugin by ID
 */
export function getWidgetPlugin(id: string): WidgetPlugin | undefined {
  return widgetPlugins.find((plugin) => plugin.id === id);
}

/**
 * Get a specific prompt from a widget plugin
 */
export function getWidgetPrompt(pluginId: string, promptId: string): WidgetPrompt | undefined {
  const plugin = getWidgetPlugin(pluginId);
  return plugin?.prompts.find((prompt) => prompt.id === promptId);
}

/**
 * Inject widget prompts into a list of items.
 * Each widget defines its own shouldInject logic and position.
 * 
 * @param items - The original list of items
 * @param context - Context passed to each widget's shouldInject function
 * @returns A new array with widget prompts injected, marked with { isWidget: true }
 */
export function injectWidgets<T>(
  items: T[],
  context: WidgetContext = {}
): (T | (WidgetPrompt & { isWidget: true }))[] {
  const widgetPrompts = getWidgetPrompts();
  
  if (widgetPrompts.length === 0 || items.length === 0) {
    return items;
  }

  // Filter widgets that should be injected based on their own logic
  const widgetsToInject = widgetPrompts.filter((widget) => {
    if (widget.shouldInject) {
      return widget.shouldInject({ ...context, itemCount: items.length });
    }
    // Default: inject if no filters are active
    return !context.filters?.q && !context.filters?.category && !context.filters?.tag;
  });

  if (widgetsToInject.length === 0) {
    return items;
  }

  const result: (T | (WidgetPrompt & { isWidget: true }))[] = [...items];
  
  // Inject each widget at its defined position
  let offset = 0;
  for (const widget of widgetsToInject) {
    const position = widget.position ?? 2;
    const insertAt = Math.min(position + offset, result.length);
    result.splice(insertAt, 0, { ...widget, isWidget: true as const });
    offset++;
  }

  return result;
}
