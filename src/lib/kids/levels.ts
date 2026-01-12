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
  // Future worlds (post-MVP)
  // {
  //   number: 2,
  //   title: "Clarity Castle",
  //   titleKey: "kids.worlds.2.title",
  //   slug: "clarity-castle",
  //   emoji: "🏰",
  //   color: "blue",
  //   levels: [],
  // },
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
