export interface Level {
  slug: string;
  title: string;
  titleKey: string; // i18n key
  description: string;
  descriptionKey: string; // i18n key
  world: number;
  levelNumber: number;
  concepts: string[];
}

export interface World {
  number: number;
  title: string;
  titleKey: string; // i18n key
  slug: string;
  emoji: string;
  color: string; // Tailwind color class
  levels: Level[];
}

export const worlds: World[] = [
  {
    number: 1,
    title: "Starter Village",
    titleKey: "kids.worlds.1.title",
    slug: "starter-village",
    emoji: "🏠",
    color: "emerald",
    levels: [
      {
        slug: "1-1-meet-promi",
        title: "Meet Promi!",
        titleKey: "kids.levels.1_1_meet_promi.title",
        description: "Say hello to your robot friend and learn what AI is",
        descriptionKey: "kids.levels.1_1_meet_promi.description",
        world: 1,
        levelNumber: 1,
        concepts: ["what-is-ai", "introduction"],
      },
      {
        slug: "1-2-first-words",
        title: "Promi's First Words",
        titleKey: "kids.levels.1_2_first_words.title",
        description: "Help Promi understand by writing your first prompt",
        descriptionKey: "kids.levels.1_2_first_words.description",
        world: 1,
        levelNumber: 2,
        concepts: ["first-prompt", "basics"],
      },
      {
        slug: "1-3-being-clear",
        title: "Being Clear",
        titleKey: "kids.levels.1_3_being_clear.title",
        description: "Learn why clear instructions work better than vague ones",
        descriptionKey: "kids.levels.1_3_being_clear.description",
        world: 1,
        levelNumber: 3,
        concepts: ["clarity", "good-vs-bad"],
      },
    ],
  },
  {
    number: 2,
    title: "Clarity Castle",
    titleKey: "kids.worlds.2.title",
    slug: "clarity-castle",
    emoji: "🏰",
    color: "blue",
    levels: [
      {
        slug: "2-1-missing-details",
        title: "The Missing Details",
        titleKey: "kids.levels.2_1_missing_details.title",
        description: "Discover why details matter - vague vs specific prompts",
        descriptionKey: "kids.levels.2_1_missing_details.description",
        world: 2,
        levelNumber: 1,
        concepts: ["specificity", "details"],
      },
      {
        slug: "2-2-who-and-what",
        title: "Who & What",
        titleKey: "kids.levels.2_2_who_and_what.title",
        description: "Add characters and objects to make prompts come alive",
        descriptionKey: "kids.levels.2_2_who_and_what.description",
        world: 2,
        levelNumber: 2,
        concepts: ["characters", "objects"],
      },
      {
        slug: "2-3-when-and-where",
        title: "When & Where",
        titleKey: "kids.levels.2_3_when_and_where.title",
        description: "Learn to add time and place to your prompts",
        descriptionKey: "kids.levels.2_3_when_and_where.description",
        world: 2,
        levelNumber: 3,
        concepts: ["time", "place"],
      },
      {
        slug: "2-4-detail-detective",
        title: "The Detail Detective",
        titleKey: "kids.levels.2_4_detail_detective.title",
        description: "Become a master of adding all the right details",
        descriptionKey: "kids.levels.2_4_detail_detective.description",
        world: 2,
        levelNumber: 4,
        concepts: ["combining", "mastery"],
      },
    ],
  },
  {
    number: 3,
    title: "Context Caves",
    titleKey: "kids.worlds.3.title",
    slug: "context-caves",
    emoji: "🕳️",
    color: "purple",
    levels: [
      {
        slug: "3-1-setting-the-scene",
        title: "Setting the Scene",
        titleKey: "kids.levels.3_1_setting_the_scene.title",
        description: "Learn why background info helps AI understand you",
        descriptionKey: "kids.levels.3_1_setting_the_scene.description",
        world: 3,
        levelNumber: 1,
        concepts: ["background", "context"],
      },
      {
        slug: "3-2-show-dont-tell",
        title: "Show, Don't Tell",
        titleKey: "kids.levels.3_2_show_dont_tell.title",
        description: "Use examples to show AI exactly what you want",
        descriptionKey: "kids.levels.3_2_show_dont_tell.description",
        world: 3,
        levelNumber: 2,
        concepts: ["examples", "demonstration"],
      },
      {
        slug: "3-3-format-finder",
        title: "The Format Finder",
        titleKey: "kids.levels.3_3_format_finder.title",
        description: "Ask for lists, stories, poems, and more!",
        descriptionKey: "kids.levels.3_3_format_finder.description",
        world: 3,
        levelNumber: 3,
        concepts: ["formats", "structure"],
      },
      {
        slug: "3-4-context-champion",
        title: "Context Champion",
        titleKey: "kids.levels.3_4_context_champion.title",
        description: "Combine all context techniques like a pro",
        descriptionKey: "kids.levels.3_4_context_champion.description",
        world: 3,
        levelNumber: 4,
        concepts: ["combining", "mastery"],
      },
    ],
  },
  {
    number: 4,
    title: "Creation Canyon",
    titleKey: "kids.worlds.4.title",
    slug: "creation-canyon",
    emoji: "🎨",
    color: "orange",
    levels: [
      {
        slug: "4-1-pretend-time",
        title: "Pretend Time!",
        titleKey: "kids.levels.4_1_pretend_time.title",
        description: "Learn role-play prompts - 'Act as...'",
        descriptionKey: "kids.levels.4_1_pretend_time.description",
        world: 4,
        levelNumber: 1,
        concepts: ["roleplay", "personas"],
      },
      {
        slug: "4-2-story-starters",
        title: "Story Starters",
        titleKey: "kids.levels.4_2_story_starters.title",
        description: "Create amazing stories with AI as your co-author",
        descriptionKey: "kids.levels.4_2_story_starters.description",
        world: 4,
        levelNumber: 2,
        concepts: ["storytelling", "narrative"],
      },
      {
        slug: "4-3-character-creator",
        title: "Character Creator",
        titleKey: "kids.levels.4_3_character_creator.title",
        description: "Give AI a personality and watch it come alive",
        descriptionKey: "kids.levels.4_3_character_creator.description",
        world: 4,
        levelNumber: 3,
        concepts: ["characters", "personality"],
      },
      {
        slug: "4-4-world-builder",
        title: "World Builder",
        titleKey: "kids.levels.4_4_world_builder.title",
        description: "Create imaginative worlds and scenarios",
        descriptionKey: "kids.levels.4_4_world_builder.description",
        world: 4,
        levelNumber: 4,
        concepts: ["worldbuilding", "imagination"],
      },
    ],
  },
  {
    number: 5,
    title: "Master Mountain",
    titleKey: "kids.worlds.5.title",
    slug: "master-mountain",
    emoji: "⛰️",
    color: "amber",
    levels: [
      {
        slug: "5-1-perfect-prompt",
        title: "The Perfect Prompt",
        titleKey: "kids.levels.5_1_perfect_prompt.title",
        description: "Combine clarity, details, and context together",
        descriptionKey: "kids.levels.5_1_perfect_prompt.description",
        world: 5,
        levelNumber: 1,
        concepts: ["combining", "advanced"],
      },
      {
        slug: "5-2-fix-it-up",
        title: "Fix It Up!",
        titleKey: "kids.levels.5_2_fix_it_up.title",
        description: "Find and improve weak prompts",
        descriptionKey: "kids.levels.5_2_fix_it_up.description",
        world: 5,
        levelNumber: 2,
        concepts: ["debugging", "improvement"],
      },
      {
        slug: "5-3-prompt-remix",
        title: "Prompt Remix",
        titleKey: "kids.levels.5_3_prompt_remix.title",
        description: "Rewrite prompts for different outcomes",
        descriptionKey: "kids.levels.5_3_prompt_remix.description",
        world: 5,
        levelNumber: 3,
        concepts: ["variation", "adaptation"],
      },
      {
        slug: "5-4-graduation-day",
        title: "Graduation Day",
        titleKey: "kids.levels.5_4_graduation_day.title",
        description: "The final challenge - become a Prompt Master!",
        descriptionKey: "kids.levels.5_4_graduation_day.description",
        world: 5,
        levelNumber: 4,
        concepts: ["final", "mastery"],
      },
    ],
  },
];

export function getAllLevels(): Level[] {
  return worlds.flatMap((world) => world.levels);
}

export function getLevelBySlug(slug: string): Level | undefined {
  return getAllLevels().find((level) => level.slug === slug);
}

export function getWorldByNumber(worldNumber: number): World | undefined {
  return worlds.find((world) => world.number === worldNumber);
}

export function getAdjacentLevels(slug: string): { prev?: Level; next?: Level } {
  const levels = getAllLevels();
  const index = levels.findIndex((level) => level.slug === slug);
  return {
    prev: index > 0 ? levels[index - 1] : undefined,
    next: index < levels.length - 1 ? levels[index + 1] : undefined,
  };
}

export function getLevelIndex(slug: string): number {
  return getAllLevels().findIndex((level) => level.slug === slug);
}

export function getTotalLevels(): number {
  return getAllLevels().length;
}
