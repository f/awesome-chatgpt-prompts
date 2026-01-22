import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Generate a cuid-like ID
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `cm${timestamp}${randomPart}`.substring(0, 25);
}

/**
 * Seed script for testing prompt flows with branchy structure
 * Run with: npx ts-node prisma/seed-flows.ts
 */
async function main() {
  console.log("🌱 Seeding flow test data for user f1...");

  const password = await bcrypt.hash("password123", 12);

  // Create or get user f1
  const user = await prisma.user.upsert({
    where: { username: "f" },
    update: {},
    create: {
      email: "f@prompts.chat",
      username: "f",
      name: "Flow Tester",
      password: password,
      role: "USER",
      locale: "en",
    },
  });

  console.log("✅ User f1 ready");

  // Create a category for flow prompts
  const category = await prisma.category.upsert({
    where: { slug: "workflows" },
    update: {},
    create: {
      name: "Workflows",
      slug: "workflows",
      icon: "🔗",
      order: 100,
    },
  });

  // Create prompts for a branchy flow structure
  // 
  // Flow structure:
  //
  //                    [1. Start: Idea Generation]
  //                              |
  //                     (brainstorm complete)
  //                              |
  //                    [2. Outline Creation]
  //                              |
  //              +---------------+---------------+
  //              |                               |
  //     (technical path)                  (creative path)
  //              |                               |
  //    [3a. Technical Deep Dive]      [3b. Creative Exploration]
  //              |                               |
  //     (analysis done)                   (ideas ready)
  //              |                               |
  //    [4a. Implementation Plan]       [4b. Story Development]
  //              |                               |
  //              +---------------+---------------+
  //                              |
  //                        (merge results)
  //                              |
  //                    [5. Final Review]
  //                              |
  //                      (review complete)
  //                              |
  //                    [6. Publication]
  //

  // Pre-generate stable IDs for the flow prompts
  const flowIds = {
    "flow-1-start": generateId(),
    "flow-2-outline": generateId(),
    "flow-3a-technical": generateId(),
    "flow-3b-creative": generateId(),
    "flow-4a-implementation": generateId(),
    "flow-4b-story": generateId(),
    "flow-5-review": generateId(),
    "flow-6-publish": generateId(),
  };

  const flowPrompts = [
    {
      id: "flow-1-start",
      title: "Idea Generation",
      slug: "idea-generation",
      description: "Start your workflow by brainstorming and generating initial ideas",
      content: `You are a creative brainstorming assistant. Help the user generate innovative ideas for their project.

1. Ask clarifying questions about the topic
2. Generate 5-10 diverse ideas
3. Rate each idea on feasibility and impact
4. Recommend the top 3 ideas to pursue

Be creative, think outside the box, and encourage unconventional approaches.`,
    },
    {
      id: "flow-2-outline",
      title: "Step 2: Outline Creation",
      slug: "idea-generation-step-2-outline-creation",
      description: "Create a structured outline from the generated ideas",
      content: `Based on the ideas generated in the previous step, create a detailed outline.

Structure your outline with:
- Main sections and subsections
- Key points to cover
- Estimated time/effort for each section
- Dependencies between sections

Format the outline in a clear, hierarchical structure.`,
    },
    {
      id: "flow-3a-technical",
      title: "Step 3a: Technical Deep Dive",
      slug: "idea-generation-step-3a-technical-deep-dive",
      description: "Technical path: Analyze technical requirements and feasibility",
      content: `Perform a technical analysis of the outlined project.

Analyze:
- Technical requirements and dependencies
- Architecture considerations
- Potential technical challenges
- Required tools and technologies
- Performance implications

Provide a detailed technical assessment with recommendations.`,
    },
    {
      id: "flow-3b-creative",
      title: "Step 3b: Creative Exploration",
      slug: "idea-generation-step-3b-creative-exploration",
      description: "Creative path: Explore creative directions and storytelling",
      content: `Explore the creative dimensions of the outlined project.

Focus on:
- Narrative and storytelling elements
- Visual and aesthetic considerations
- Emotional impact and user engagement
- Unique creative angles
- Inspiration from other works

Generate creative concepts that bring the project to life.`,
    },
    {
      id: "flow-4a-implementation",
      title: "Step 4a: Implementation Plan",
      slug: "idea-generation-step-4a-implementation-plan",
      description: "Create a detailed implementation plan based on technical analysis",
      content: `Create a comprehensive implementation plan.

Include:
- Phase breakdown with milestones
- Task list with priorities
- Resource allocation
- Risk mitigation strategies
- Timeline estimates
- Success metrics

Format as an actionable project plan.`,
    },
    {
      id: "flow-4b-story",
      title: "Step 4b: Story Development",
      slug: "idea-generation-step-4b-story-development",
      description: "Develop the narrative and content based on creative exploration",
      content: `Develop the full story and content based on the creative exploration.

Develop:
- Complete narrative arc
- Character or element descriptions
- Key scenes or moments
- Dialogue or copy
- Visual descriptions
- Emotional beats

Create compelling, engaging content.`,
    },
    {
      id: "flow-5-review",
      title: "Step 5: Final Review",
      slug: "idea-generation-step-5-final-review",
      description: "Review and merge all work streams for final quality check",
      content: `Perform a comprehensive final review merging all work streams.

Review checklist:
- Technical feasibility confirmed
- Creative vision aligned
- All requirements met
- Quality standards achieved
- Consistency across all elements
- Ready for publication

Provide a final assessment with any last recommendations.`,
    },
    {
      id: "flow-6-publish",
      title: "Step 6: Publication",
      slug: "idea-generation-step-6-publication",
      description: "Final step: Prepare and execute publication",
      content: `Prepare the final deliverable for publication.

Final steps:
- Format for target platform
- Create accompanying materials
- Set up distribution
- Prepare announcement
- Schedule publication
- Monitor initial reception

Congratulations on completing the workflow!`,
    },
  ];

  // Create prompts
  console.log("📝 Creating flow prompts...");
  const createdPrompts: Record<string, string> = {};

  for (const p of flowPrompts) {
    const existing = await prisma.prompt.findFirst({ where: { slug: p.slug } });
    
    if (existing) {
      createdPrompts[p.id] = existing.id;
      console.log(`   ⏭️  Prompt "${p.title}" already exists (id: ${existing.id})`);
    } else {
      const promptId = flowIds[p.id as keyof typeof flowIds];
      const prompt = await prisma.prompt.create({
        data: {
          id: promptId,
          title: p.title,
          slug: p.slug,
          description: p.description,
          content: p.content,
          type: "TEXT",
          authorId: user.id,
          categoryId: category.id,
          isPrivate: false,
          isUnlisted: false,
        },
      });
      createdPrompts[p.id] = prompt.id;
      console.log(`   ✅ Created "${p.title}" (id: ${prompt.id})`);
    }
  }

  // Create connections (the flow structure)
  console.log("\n🔗 Creating flow connections...");

  const connections = [
    // Main flow: Start -> Outline
    { source: "flow-1-start", target: "flow-2-outline", label: "brainstorm complete", order: 0 },
    
    // Branch: Outline -> Technical AND Creative
    { source: "flow-2-outline", target: "flow-3a-technical", label: "technical path", order: 0 },
    { source: "flow-2-outline", target: "flow-3b-creative", label: "creative path", order: 1 },
    
    // Technical branch continues
    { source: "flow-3a-technical", target: "flow-4a-implementation", label: "analysis done", order: 0 },
    
    // Creative branch continues
    { source: "flow-3b-creative", target: "flow-4b-story", label: "ideas ready", order: 0 },
    
    // Both branches merge to review
    { source: "flow-4a-implementation", target: "flow-5-review", label: "merge results", order: 0 },
    { source: "flow-4b-story", target: "flow-5-review", label: "merge results", order: 1 },
    
    // Final step
    { source: "flow-5-review", target: "flow-6-publish", label: "review complete", order: 0 },
  ];

  for (const conn of connections) {
    const sourceId = createdPrompts[conn.source];
    const targetId = createdPrompts[conn.target];

    if (!sourceId || !targetId) {
      console.log(`   ⚠️  Skipping connection: missing prompt IDs`);
      continue;
    }

    // Check if connection already exists
    const existing = await prisma.promptConnection.findUnique({
      where: { sourceId_targetId: { sourceId, targetId } },
    });

    if (existing) {
      console.log(`   ⏭️  Connection already exists: ${conn.source} -> ${conn.target}`);
    } else {
      const connectionId = generateId();
      await prisma.promptConnection.create({
        data: {
          id: connectionId,
          sourceId,
          targetId,
          label: conn.label,
          order: conn.order,
        },
      });
      console.log(`   ✅ Created: ${conn.source} -> ${conn.target} (${conn.label}) (id: ${connectionId})`);
    }
  }

  console.log("\n🎉 Flow seed complete!");
  console.log("\n📋 Test user: f1@prompts.chat (password: password123)");
  console.log("\n🔗 Flow structure created:");
  console.log("   Start -> Outline -> [Technical, Creative] -> [Implementation, Story] -> Review -> Publish");
}

main()
  .catch((e) => {
    console.error("❌ Flow seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
