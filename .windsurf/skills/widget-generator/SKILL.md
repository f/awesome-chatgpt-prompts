---
name: widget-generator
description: Generate customizable widget plugins for the prompts.chat feed system
---

# Widget Generator Skill

This skill guides creation of widget plugins for **prompts.chat**. Widgets are injected into prompt feeds to display promotional content, sponsor cards, or custom interactive components.

## Overview

Widgets support two rendering modes:
1. **Standard prompt widget** - Uses default `PromptCard` styling (like `coderabbit.ts`)
2. **Custom render widget** - Full custom React component (like `book.tsx`)

## Prerequisites

Before creating a widget, gather from the user:

| Parameter | Required | Description |
|-----------|----------|-------------|
| Widget ID | ✅ | Unique identifier (kebab-case, e.g., `my-sponsor`) |
| Widget Name | ✅ | Display name for the plugin |
| Rendering Mode | ✅ | `standard` or `custom` |
| Sponsor Info | ❌ | Name, logo, logoDark, URL (for sponsored widgets) |

## Step 1: Gather Widget Configuration

Ask the user for the following configuration options:

### Basic Info
```
- id: string (unique, kebab-case)
- name: string (display name)
- slug: string (URL-friendly identifier)
- title: string (card title)
- description: string (card description)
```

### Content (for standard mode)
```
- content: string (prompt content, can be multi-line markdown)
- type: "TEXT" | "STRUCTURED"
- structuredFormat?: "json" | "yaml" (if type is STRUCTURED)
```

### Categorization
```
- tags?: string[] (e.g., ["AI", "Development"])
- category?: string (e.g., "Development", "Writing")
```

### Action Button
```
- actionUrl?: string (CTA link)
- actionLabel?: string (CTA button text)
```

### Sponsor (optional)
```
- sponsor?: {
    name: string
    logo: string (path to light mode logo)
    logoDark?: string (path to dark mode logo)
    url: string (sponsor website)
  }
```

### Positioning Strategy
```
- positioning: {
    position: number (0-indexed start position, default: 2)
    mode: "once" | "repeat" (default: "once")
    repeatEvery?: number (for repeat mode, e.g., 30)
    maxCount?: number (max occurrences, default: 1 for once, unlimited for repeat)
  }
```

### Injection Logic
```
- shouldInject?: (context) => boolean
  Context contains:
  - filters.q: search query
  - filters.category: category name
  - filters.categorySlug: category slug
  - filters.tag: tag filter
  - filters.sort: sort option
  - itemCount: total items in feed
```

## Step 2: Create Widget File

### Standard Widget (TypeScript only)

Create file: `src/lib/plugins/widgets/{widget-id}.ts`

```typescript
import type { WidgetPlugin } from "./types";

export const {widgetId}Widget: WidgetPlugin = {
  id: "{widget-id}",
  name: "{Widget Name}",
  prompts: [
    {
      id: "{prompt-id}",
      slug: "{prompt-slug}",
      title: "{Title}",
      description: "{Description}",
      content: `{Multi-line content here}`,
      type: "TEXT",
      // Optional sponsor
      sponsor: {
        name: "{Sponsor Name}",
        logo: "/sponsors/{sponsor}.svg",
        logoDark: "/sponsors/{sponsor}-dark.svg",
        url: "{sponsor-url}",
      },
      tags: ["{Tag1}", "{Tag2}"],
      category: "{Category}",
      actionUrl: "{action-url}",
      actionLabel: "{Action Label}",
      positioning: {
        position: 2,
        mode: "repeat",
        repeatEvery: 50,
        maxCount: 3,
      },
      shouldInject: (context) => {
        const { filters } = context;
        
        // Always show when no filters active
        if (!filters?.q && !filters?.category && !filters?.tag) {
          return true;
        }
        
        // Add custom filter logic here
        return false;
      },
    },
  ],
};
```

### Custom Render Widget (TSX with React)

Create file: `src/lib/plugins/widgets/{widget-id}.tsx`

```tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { WidgetPlugin } from "./types";

function {WidgetName}Widget() {
  return (
    <div className="group border rounded-[var(--radius)] overflow-hidden hover:border-foreground/20 transition-colors bg-gradient-to-br from-primary/5 via-background to-primary/10 p-5">
      {/* Custom widget content */}
      <div className="flex flex-col items-center gap-4">
        {/* Image/visual element */}
        <div className="relative w-full aspect-video">
          <Image
            src="/path/to/image.jpg"
            alt="{Alt text}"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        
        {/* Content */}
        <div className="w-full text-center">
          <h3 className="font-semibold text-base mb-1.5">{Title}</h3>
          <p className="text-xs text-muted-foreground mb-4">{Description}</p>
          <Button asChild size="sm" className="w-full">
            <Link href="{action-url}">{Action Label}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const {widgetId}Widget: WidgetPlugin = {
  id: "{widget-id}",
  name: "{Widget Name}",
  prompts: [
    {
      id: "{prompt-id}",
      slug: "{prompt-slug}",
      title: "{Title}",
      description: "{Description}",
      content: "",
      type: "TEXT",
      tags: ["{Tag1}", "{Tag2}"],
      category: "{Category}",
      actionUrl: "{action-url}",
      actionLabel: "{Action Label}",
      positioning: {
        position: 10,
        mode: "repeat",
        repeatEvery: 60,
        maxCount: 4,
      },
      shouldInject: () => true,
      render: () => <{WidgetName}Widget />,
    },
  ],
};
```

## Step 3: Register Widget

Edit `src/lib/plugins/widgets/index.ts`:

1. Add import at top:
```typescript
import { {widgetId}Widget } from "./{widget-id}";
```

2. Add to `widgetPlugins` array:
```typescript
const widgetPlugins: WidgetPlugin[] = [
  coderabbitWidget,
  bookWidget,
  {widgetId}Widget, // Add new widget
];
```

## Step 4: Add Sponsor Assets (if applicable)

If the widget has a sponsor:
1. Add light logo: `public/sponsors/{sponsor}.svg`
2. Add dark logo (optional): `public/sponsors/{sponsor}-dark.svg`

## Positioning Examples

### Show once at position 5
```typescript
positioning: {
  position: 5,
  mode: "once",
}
```

### Repeat every 30 items, max 5 times
```typescript
positioning: {
  position: 3,
  mode: "repeat",
  repeatEvery: 30,
  maxCount: 5,
}
```

### Unlimited repeating
```typescript
positioning: {
  position: 2,
  mode: "repeat",
  repeatEvery: 25,
  // No maxCount = unlimited
}
```

## shouldInject Examples

### Always show
```typescript
shouldInject: () => true,
```

### Only when no filters active
```typescript
shouldInject: (context) => {
  const { filters } = context;
  return !filters?.q && !filters?.category && !filters?.tag;
},
```

### Show for specific categories
```typescript
shouldInject: (context) => {
  const slug = context.filters?.categorySlug?.toLowerCase();
  return slug?.includes("development") || slug?.includes("coding");
},
```

### Show when search matches keywords
```typescript
shouldInject: (context) => {
  const query = context.filters?.q?.toLowerCase() || "";
  return ["ai", "automation", "workflow"].some(kw => query.includes(kw));
},
```

### Show only when enough items
```typescript
shouldInject: (context) => {
  return (context.itemCount ?? 0) >= 10;
},
```

## Custom Render Patterns

### Card with gradient background
```tsx
<div className="border rounded-[var(--radius)] overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-5">
```

### Sponsor badge
```tsx
<div className="flex items-center gap-2 mb-2">
  <span className="text-xs font-medium text-primary">Sponsored</span>
</div>
```

### Responsive image
```tsx
<div className="relative w-full aspect-video">
  <Image src="/image.jpg" alt="..." fill className="object-cover" />
</div>
```

### CTA button
```tsx
<Button asChild size="sm" className="w-full">
  <Link href="https://example.com">
    Learn More
    <ArrowRight className="ml-2 h-3.5 w-3.5" />
  </Link>
</Button>
```

## Verification

1. Run type check:
   ```bash
   npx tsc --noEmit
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Navigate to `/discover` or `/feed` to verify widget appears at configured positions

## Type Reference

```typescript
interface WidgetPrompt {
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
  positioning?: {
    position?: number;      // Default: 2
    mode?: "once" | "repeat"; // Default: "once"
    repeatEvery?: number;   // For repeat mode
    maxCount?: number;      // Max occurrences
  };
  shouldInject?: (context: WidgetContext) => boolean;
  render?: () => ReactNode; // For custom rendering
}

interface WidgetPlugin {
  id: string;
  name: string;
  prompts: WidgetPrompt[];
}
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Widget not showing | Check `shouldInject` logic, verify registration in `index.ts` |
| TypeScript errors | Ensure imports from `./types`, check sponsor object shape |
| Styling issues | Use Tailwind classes, match existing widget patterns |
| Position wrong | Remember positions are 0-indexed, check `repeatEvery` value |
