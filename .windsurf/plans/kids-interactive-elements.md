# New Interactive Elements for Kids Levels

Add 5 new interactive components to enhance kids learning, inspired by key concepts from the prompting book.

---

## Current State

### Existing Components
| Component | Purpose | Used In |
|-----------|---------|---------|
| `PromptVsMistake` | Choose between good/bad prompts | All worlds |
| `MagicWords` | Fill-in-the-blank prompts | All worlds |
| `DragDropPrompt` | Arrange prompt pieces in order | World 2-5 |
| `Panel/StoryScene` | Story dialogue with Promi | All worlds |
| `LevelComplete` | Celebration with stars | All worlds |

### Book Concepts Not Yet Covered for Kids
1. **Few-shot learning** - Teaching by example
2. **Iterative refinement** - Improving prompts step-by-step
3. **Prompt anatomy** - Understanding prompt parts (role, context, task, format)
4. **Common pitfalls** - Recognizing and avoiding mistakes
5. **Chain of thought** - Step-by-step reasoning

---

## Proposed New Components

### 1. `<PromptLab />` - Interactive Prompt Tester
**Concept**: Kids build a prompt and see a simulated AI response (pre-defined).

**Props**:
```tsx
<PromptLab
  scenario="Ask about a pet"
  basePrompt="Tell me about dogs"
  improvements={[
    { add: "that are good with kids", effect: "Now mentions family-friendly breeds!" },
    { add: "in 3 sentences", effect: "Response is shorter and clearer!" }
  ]}
  finalResponse="Golden Retrievers are great with kids because..."
/>
```

**UX**: 
- Shows base prompt with "add detail" buttons
- Each addition shows immediate simulated response change
- Teaches iterative refinement concept

**Book Reference**: Chapter 8 (Iterative Refinement)

---

### 2. `<PromptParts />` - Anatomy Highlighter
**Concept**: Interactive visualization of prompt components.

**Props**:
```tsx
<PromptParts
  prompt="You are a friendly teacher. Explain fractions to a 10-year-old using pizza examples. Keep it under 50 words."
  parts={[
    { text: "You are a friendly teacher", type: "role", color: "purple" },
    { text: "Explain fractions to a 10-year-old", type: "task", color: "blue" },
    { text: "using pizza examples", type: "example", color: "green" },
    { text: "Keep it under 50 words", type: "constraint", color: "orange" }
  ]}
/>
```

**UX**:
- Colored highlights on prompt parts
- Tap a part to see explanation
- Legend shows what each color means

**Book Reference**: Chapter 2 (Anatomy of a Prompt)

---

### 3. `<ExampleMatcher />` - Few-Shot Learning Game
**Concept**: Match examples to teach AI patterns.

**Props**:
```tsx
<ExampleMatcher
  title="Teach the Pattern!"
  examples={[
    { input: "happy", output: "😊" },
    { input: "sad", output: "😢" },
    { input: "angry", output: "???" }
  ]}
  correctAnswer="😠"
  options={["😠", "😊", "🎉", "😴"]}
  explanation="The AI learns: words → matching emoji!"
/>
```

**UX**:
- Shows pattern with examples
- Kids choose what comes next
- Teaches few-shot learning concept

**Book Reference**: Chapter 7 (Few-Shot Learning)

---

### 4. `<PromptDoctor />` - Fix the Prompt
**Concept**: Identify and fix problems in broken prompts.

**Props**:
```tsx
<PromptDoctor
  brokenPrompt="Write something"
  problems={[
    { issue: "Too vague", fix: "Write a poem" },
    { issue: "No topic", fix: "Write a poem about friendship" },
    { issue: "No length", fix: "Write a short poem about friendship" }
  ]}
  healedPrompt="Write a short poem about friendship"
/>
```

**UX**:
- Shows "sick" prompt with symptoms
- Kids tap problems to apply fixes
- Prompt "heals" as problems are fixed
- Fun medical/doctor theme

**Book Reference**: Chapter 15 (Common Pitfalls)

---

### 5. `<StepByStep />` - Chain of Thought Builder
**Concept**: Teach kids to ask AI to show its work.

**Props**:
```tsx
<StepByStep
  problem="How many legs do 3 dogs and 2 cats have?"
  wrongAnswer="20 legs (AI just guessed!)"
  steps={[
    "Dogs have 4 legs each",
    "3 dogs × 4 legs = 12 legs",
    "Cats have 4 legs each",
    "2 cats × 4 legs = 8 legs",
    "12 + 8 = 20 legs total"
  ]}
  rightAnswer="20 legs (and we can check the work!)"
  magicWords="Let's think step by step"
/>
```

**UX**:
- Shows problem with wrong answer first
- Kids add "magic words" to unlock step-by-step
- Steps reveal one at a time
- Teaches chain of thought prompting

**Book Reference**: Chapter 6 (Chain of Thought)

---

## Implementation Priority

| Priority | Component | Complexity | Impact |
|----------|-----------|------------|--------|
| 1 | `PromptParts` | Medium | High - visual learning |
| 2 | `ExampleMatcher` | Low | High - gamification |
| 3 | `PromptDoctor` | Medium | High - error recognition |
| 4 | `StepByStep` | Low | Medium - advanced concept |
| 5 | `PromptLab` | High | Medium - complex interactions |

---

## Level Integration

### Where to Add Components

| World | Level | New Component | Concept |
|-------|-------|---------------|---------|
| 2 | 2-4 Detail Detective | `PromptParts` | See prompt anatomy |
| 3 | 3-2 Show Don't Tell | `ExampleMatcher` | Teach by example |
| 5 | 5-2 Fix It Up | `PromptDoctor` | Fix broken prompts |
| 5 | 5-1 Perfect Prompt | `StepByStep` | Complex reasoning |
| 5 | 5-3 Prompt Remix | `PromptLab` | Iterate and improve |

---

## Estimated Work

- **Component Development**: ~2-3 hours per component
- **Level Content Updates**: ~30 min per level
- **i18n**: Add translation keys for new component labels
- **Testing**: Visual review on mobile/desktop

---

## Questions for User

1. **Priority**: Should I implement all 5, or start with top 2-3?
2. **Theming**: Any specific visual style preferences (medical theme for PromptDoctor, etc.)?
3. **Complexity**: Is `PromptLab` too complex for MVP, or should it be simpler?
