# Prompts.chat/Kids - Gamified Prompting for Children

A game-based learning experience that teaches kids (ages 8-14) prompting through stories, levels, and interactive challenges - starting with World 1 MVP.

---

## ✅ Confirmed Decisions

| Decision | Choice |
|----------|--------|
| **Age Range** | 8-14 (reading/writing required) |
| **Login** | Not required (local storage for progress) |
| **AI Calls** | No real AI - pre-defined responses only |
| **i18n** | All 16 languages from day 1 |
| **MVP Scope** | World 1 only (3 levels) |
| **Character** | **Chip** 🤖 - friendly robot guide |

---

## Overview

**Target Audience**: Children ages 8-14  
**Goal**: Teach AI prompting through play - each section is a "level" with storylines, characters, and hands-on activities  
**URL**: `prompts.chat/kids`

---

## Core Concepts

### 1. Story-Driven Learning
- **Main Character**: **Chip** 🤖 - a friendly, curious robot who needs help learning to talk to AI
- **Narrative**: Kids teach Chip how to write better prompts by completing missions
- **World**: A colorful "Prompt Land" with themed zones

### 2. Level Structure

#### MVP: World 1 - Starter Village (3 Levels)
| Level | Title | Concepts |
|-------|-------|----------|
| 1-1 | "Meet Chip!" | What is AI? Introducing prompts |
| 1-2 | "Chip's First Words" | Writing a simple prompt |
| 1-3 | "Being Clear" | Why clarity matters, good vs bad prompts |

#### Future Worlds (post-MVP)
| World | Theme | Concepts |
|-------|-------|----------|
| **World 2: Clarity Castle** | Specificity | Adding details, who/what/when/where |
| **World 3: Context Caves** | Context | Background info, examples |
| **World 4: Creation Canyon** | Creativity | Role-play, storytelling |
| **World 5: Master Mountain** | Advanced | Combining all skills |

### 3. Gamification System
- **Stars (1-3)**: Earned per level based on performance
- **Progress Map**: Visual path showing completed levels
- **Local Storage**: Progress saved without login

---

## Interactive Components (Kids-Specific)

### New Components to Build

| Component | Description |
|-----------|-------------|
| `<DragDropPrompt />` | Drag prompt pieces into correct order |
| `<PromptBuilder />` (kid version) | Visual block-based prompt builder |
| `<StoryScene />` | Animated story panels with dialogue |
| `<PromptVsMistake />` | Choose between good/bad prompts |
| `<MagicWords />` | Fill-in word blanks with visual hints |
| `<RobotChat />` | Simplified chat interface to try prompts |
| `<ProgressMap />` | World map showing level progress |
| `<LevelComplete />` | Celebration screen with stars/badges |
| `<CharacterGuide />` | Robot character with speech bubbles |

### Reusable from Book
- `Quiz` (simplified)
- `FillInTheBlank` (with visual hints)
- `Callout` (kid-friendly styles)

---

## File Structure

```
src/
├── app/kids/
│   ├── page.tsx              # Kids landing page (game intro)
│   ├── layout.tsx            # Kids-specific layout (playful theme)
│   ├── map/page.tsx          # World map / level selector
│   └── level/
│       └── [slug]/page.tsx   # Dynamic level pages
├── components/kids/
│   ├── elements/             # Kid-specific interactive components
│   │   ├── drag-drop-prompt.tsx
│   │   ├── story-scene.tsx
│   │   ├── prompt-vs-mistake.tsx
│   │   ├── magic-words.tsx
│   │   ├── robot-chat.tsx
│   │   ├── progress-map.tsx
│   │   ├── level-complete.tsx
│   │   └── character-guide.tsx
│   ├── layout/
│   │   ├── kids-header.tsx
│   │   └── kids-sidebar.tsx
│   └── ui/
│       └── kid-button.tsx    # Playful button variants
├── content/kids/             # MDX content for levels
│   ├── 1-1-what-is-ai.mdx
│   ├── 1-2-first-prompt.mdx
│   ├── 1-3-be-clear.mdx
│   └── ... (15 levels total)
└── lib/kids/
    ├── levels.ts             # Level configuration
    └── progress.ts           # Progress tracking utilities
```

---

## Sample Level Content

### Level 1-1: "What is AI?"

```mdx
<StoryScene>
  <Panel character="sparky" mood="happy">
    Hi there! I'm Sparky, your AI robot friend! 
    Do you know what AI means?
  </Panel>
  <Panel character="sparky" mood="thinking">
    AI stands for "Artificial Intelligence" - 
    that's a fancy way of saying a computer that can think!
  </Panel>
</StoryScene>

<PromptVsMistake
  question="Which is a better way to ask AI for help?"
  good="Please write me a short story about a brave cat"
  bad="story"
  explanation="AI needs more words to understand what you want!"
/>

<MagicWords
  sentence="Please write a story about a ___ who goes on an adventure to find ___"
  blanks={[
    { hint: "🐕 an animal", answers: ["dog", "cat", "bunny"] },
    { hint: "💎 something special", answers: ["treasure", "gold", "friend"] }
  ]}
/>
```

---

## Design Considerations

### Visual Style
- **Colors**: Bright, friendly palette (not the adult book's muted tones)
- **Typography**: Larger, rounded fonts (kid-readable)
- **Illustrations**: Cartoon-style characters and icons
- **Animations**: Bouncy, celebratory micro-interactions

### Accessibility
- Large tap targets for younger users
- Audio support for text (optional read-aloud)
- Simple vocabulary, short sentences
- Clear visual feedback

### Progress Persistence
- **Option A**: Local storage (no login required)
- **Option B**: Logged-in users save to database
- Show progress on parent/teacher dashboard (future)

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create `/kids` route with layout
- [ ] Design kid-friendly theme/styles
- [ ] Build `ProgressMap` component
- [ ] Build `StoryScene` component
- [ ] Set up level configuration system

### Phase 2: Core Interactions
- [ ] Build `DragDropPrompt` component
- [ ] Build `PromptVsMistake` component  
- [ ] Build `MagicWords` component
- [ ] Build `RobotChat` component (simplified)
- [ ] Build `LevelComplete` celebration screen

### Phase 3: Content
- [ ] Write World 1 content (3 levels)
- [ ] Write World 2 content (3 levels)
- [ ] Write World 3 content (3 levels)
- [ ] Write World 4 content (3 levels)
- [ ] Write World 5 content (3 levels)

### Phase 4: Polish
- [ ] Add animations and sound effects
- [ ] Progress persistence
- [ ] Badge/achievement system
- [ ] Responsive design testing
- [ ] Accessibility review

---

## Implementation Order

1. **Route & Layout** - `/kids` with playful theme
2. **Level Config** - `lib/kids/levels.ts` + progress utilities
3. **Core Components** - StoryScene, CharacterGuide, ProgressMap
4. **Interactive Components** - DragDropPrompt, PromptVsMistake, MagicWords
5. **Celebration** - LevelComplete with stars
6. **Content** - 3 MDX files for World 1
7. **i18n** - Add translations to all 16 locale files
8. **Progress** - Local storage persistence
