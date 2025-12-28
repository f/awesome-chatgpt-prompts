import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create users
  const password = await bcrypt.hash("password123", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@prompts.chat" },
    update: {},
    create: {
      email: "admin@prompts.chat",
      username: "admin",
      name: "Admin User",
      password: password,
      role: "ADMIN",
      locale: "en",
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@prompts.chat" },
    update: {},
    create: {
      email: "demo@prompts.chat",
      username: "demo",
      name: "Demo User",
      password: password,
      role: "USER",
      locale: "en",
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      username: "alice",
      name: "Alice Johnson",
      password: password,
      role: "USER",
      locale: "en",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      username: "bob",
      name: "Bob Smith",
      password: password,
      role: "USER",
      locale: "tr",
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: {
      email: "charlie@example.com",
      username: "charlie",
      name: "Charlie Brown",
      password: password,
      role: "USER",
      locale: "en",
    },
  });

  const users = [admin, demo, alice, bob, charlie];
  console.log("✅ Created", users.length, "users");

  // Create parent categories
  const coding = await prisma.category.upsert({
    where: { slug: "coding" },
    update: {},
    create: { name: "Coding", slug: "coding", description: "Programming and development prompts", icon: "💻", order: 1 },
  });

  const writing = await prisma.category.upsert({
    where: { slug: "writing" },
    update: {},
    create: { name: "Writing", slug: "writing", description: "Content writing and copywriting", icon: "✍️", order: 2 },
  });

  const business = await prisma.category.upsert({
    where: { slug: "business" },
    update: {},
    create: { name: "Business", slug: "business", description: "Business strategy and operations", icon: "💼", order: 3 },
  });

  const creative = await prisma.category.upsert({
    where: { slug: "creative" },
    update: {},
    create: { name: "Creative", slug: "creative", description: "Art, design, and creative work", icon: "🎨", order: 4 },
  });

  const education = await prisma.category.upsert({
    where: { slug: "education" },
    update: {},
    create: { name: "Education", slug: "education", description: "Learning and teaching prompts", icon: "📚", order: 5 },
  });

  // Create nested categories (children)
  const webDev = await prisma.category.upsert({
    where: { slug: "web-development" },
    update: {},
    create: { name: "Web Development", slug: "web-development", description: "Frontend and backend web development", parentId: coding.id, order: 1 },
  });

  const mobileDev = await prisma.category.upsert({
    where: { slug: "mobile-development" },
    update: {},
    create: { name: "Mobile Development", slug: "mobile-development", description: "iOS and Android development", parentId: coding.id, order: 2 },
  });

  const devops = await prisma.category.upsert({
    where: { slug: "devops" },
    update: {},
    create: { name: "DevOps", slug: "devops", description: "CI/CD, cloud, and infrastructure", parentId: coding.id, order: 3 },
  });

  const dataScience = await prisma.category.upsert({
    where: { slug: "data-science" },
    update: {},
    create: { name: "Data Science", slug: "data-science", description: "ML, AI, and data analysis", parentId: coding.id, order: 4 },
  });

  const blogWriting = await prisma.category.upsert({
    where: { slug: "blog-writing" },
    update: {},
    create: { name: "Blog Writing", slug: "blog-writing", description: "Blog posts and articles", parentId: writing.id, order: 1 },
  });

  const copywriting = await prisma.category.upsert({
    where: { slug: "copywriting" },
    update: {},
    create: { name: "Copywriting", slug: "copywriting", description: "Sales and marketing copy", parentId: writing.id, order: 2 },
  });

  const technicalWriting = await prisma.category.upsert({
    where: { slug: "technical-writing" },
    update: {},
    create: { name: "Technical Writing", slug: "technical-writing", description: "Documentation and guides", parentId: writing.id, order: 3 },
  });

  const marketing = await prisma.category.upsert({
    where: { slug: "marketing" },
    update: {},
    create: { name: "Marketing", slug: "marketing", description: "Marketing and advertising prompts", parentId: business.id, order: 1 },
  });

  const sales = await prisma.category.upsert({
    where: { slug: "sales" },
    update: {},
    create: { name: "Sales", slug: "sales", description: "Sales strategies and outreach", parentId: business.id, order: 2 },
  });

  const hr = await prisma.category.upsert({
    where: { slug: "hr" },
    update: {},
    create: { name: "HR & Recruiting", slug: "hr", description: "Human resources and hiring", parentId: business.id, order: 3 },
  });

  const imageGen = await prisma.category.upsert({
    where: { slug: "image-generation" },
    update: {},
    create: { name: "Image Generation", slug: "image-generation", description: "AI image prompts", parentId: creative.id, order: 1 },
  });

  const music = await prisma.category.upsert({
    where: { slug: "music" },
    update: {},
    create: { name: "Music", slug: "music", description: "Music and audio generation", parentId: creative.id, order: 2 },
  });

  // Create Workflows category (for structured prompts)
  const workflows = await prisma.category.upsert({
    where: { slug: "workflows" },
    update: {},
    create: { name: "Workflows", slug: "workflows", description: "Structured AI workflows and pipelines", icon: "⚡", order: 6 },
  });

  const agentWorkflows = await prisma.category.upsert({
    where: { slug: "agent-workflows" },
    update: {},
    create: { name: "Agent Workflows", slug: "agent-workflows", description: "Multi-step AI agent configurations", parentId: workflows.id, order: 1 },
  });

  const automations = await prisma.category.upsert({
    where: { slug: "automations" },
    update: {},
    create: { name: "Automations", slug: "automations", description: "Automated task pipelines", parentId: workflows.id, order: 2 },
  });

  const categories = [coding, writing, business, creative, education, workflows, webDev, mobileDev, devops, dataScience, blogWriting, copywriting, technicalWriting, marketing, sales, hr, imageGen, music, agentWorkflows, automations];
  console.log("✅ Created", categories.length, "categories (including nested)");

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "gpt-4" },
      update: {},
      create: { name: "GPT-4", slug: "gpt-4", color: "#10B981" },
    }),
    prisma.tag.upsert({
      where: { slug: "claude" },
      update: {},
      create: { name: "Claude", slug: "claude", color: "#8B5CF6" },
    }),
    prisma.tag.upsert({
      where: { slug: "midjourney" },
      update: {},
      create: { name: "Midjourney", slug: "midjourney", color: "#F59E0B" },
    }),
    prisma.tag.upsert({
      where: { slug: "dalle" },
      update: {},
      create: { name: "DALL-E", slug: "dalle", color: "#EC4899" },
    }),
    prisma.tag.upsert({
      where: { slug: "beginner" },
      update: {},
      create: { name: "Beginner", slug: "beginner", color: "#06B6D4" },
    }),
    prisma.tag.upsert({
      where: { slug: "advanced" },
      update: {},
      create: { name: "Advanced", slug: "advanced", color: "#EF4444" },
    }),
    prisma.tag.upsert({
      where: { slug: "chain-of-thought" },
      update: {},
      create: { name: "Chain of Thought", slug: "chain-of-thought", color: "#3B82F6" },
    }),
    prisma.tag.upsert({
      where: { slug: "system-prompt" },
      update: {},
      create: { name: "System Prompt", slug: "system-prompt", color: "#6366F1" },
    }),
    prisma.tag.upsert({
      where: { slug: "workflow" },
      update: {},
      create: { name: "Workflow", slug: "workflow", color: "#F97316" },
    }),
    prisma.tag.upsert({
      where: { slug: "agent" },
      update: {},
      create: { name: "Agent", slug: "agent", color: "#14B8A6" },
    }),
    prisma.tag.upsert({
      where: { slug: "skill" },
      update: {},
      create: { name: "Skill", slug: "skill", color: "#8B5CF6" },
    }),
    prisma.tag.upsert({
      where: { slug: "copilot" },
      update: {},
      create: { name: "Copilot", slug: "copilot", color: "#000000" },
    }),
  ]);
  console.log("✅ Created", tags.length, "tags");

  // Create sample prompts - distributed among users
  const prompts = [
    // Admin's prompts
    { title: "Code Review Assistant", description: "A prompt for thorough code reviews", content: `You are an expert code reviewer. Review the following code:\n\n{{code}}\n\nProvide:\n1. Summary\n2. Strengths\n3. Issues\n4. Improvements\n5. Performance suggestions`, type: "TEXT", categorySlug: "web-development", tagSlugs: ["gpt-4", "advanced"], authorId: admin.id },
    { title: "Expert System Prompt", description: "Turn AI into a domain expert", content: `You are an expert {{role}} with {{years}} years of experience in {{domain}}. Be precise, professional, and provide actionable insights.`, type: "TEXT", categorySlug: "coding", tagSlugs: ["system-prompt", "advanced", "gpt-4"], authorId: admin.id },
    { title: "Lesson Plan Creator", description: "Create structured lesson plans", content: `Create a lesson plan for {{subject}} - {{topic}} for {{grade}} level. Include objectives, materials, activities, and assessment.`, type: "TEXT", categorySlug: "education", tagSlugs: ["gpt-4", "beginner"], authorId: admin.id },
    { title: "DALL-E Product Mockup", description: "Professional product mockups", content: `A professional product photo of {{product}} on {{surface}}, soft studio lighting, high-end advertising style, 4k`, type: "IMAGE", categorySlug: "image-generation", tagSlugs: ["dalle", "beginner"], authorId: admin.id },
    { title: "Email Response Generator", description: "Professional email responses", content: `Write a professional email response to: {{original_email}}\n\nTone: {{tone}}\nDesired outcome: {{outcome}}`, type: "TEXT", categorySlug: "business", tagSlugs: ["gpt-4", "beginner"], authorId: admin.id },
    
    // Demo user's prompts
    { title: "Blog Post Generator", description: "Generate engaging blog posts", content: `Write a blog post about {{topic}} for {{audience}}. Include engaging intro, 3-5 sections, practical tips, and CTA. Word count: {{word_count}}`, type: "TEXT", categorySlug: "blog-writing", tagSlugs: ["gpt-4", "beginner"], authorId: demo.id },
    { title: "SWOT Analysis Generator", description: "Comprehensive SWOT analysis", content: `Conduct a SWOT analysis for {{subject}} in {{industry}}. Provide Strengths, Weaknesses, Opportunities, Threats, and Strategic Recommendations.`, type: "TEXT", categorySlug: "business", tagSlugs: ["gpt-4", "chain-of-thought"], authorId: demo.id },
    { title: "Midjourney Fantasy Landscape", description: "Stunning fantasy landscape images", content: `A breathtaking fantasy landscape, {{scene_type}}, ancient ruins, floating islands, dramatic lighting, volumetric fog, 8k --ar 16:9 --v 6`, type: "IMAGE", categorySlug: "image-generation", tagSlugs: ["midjourney", "advanced"], authorId: demo.id },
    { title: "Debug Assistant", description: "Systematic debugging help", content: `Debug this issue:\n\nError: {{error}}\nCode: {{code}}\nTried: {{attempts}}\n\nExplain the error, root cause, fix, and prevention.`, type: "TEXT", categorySlug: "coding", tagSlugs: ["gpt-4", "claude", "chain-of-thought"], authorId: demo.id },
    
    // Alice's prompts
    { title: "React Component Generator", description: "Generate React components with TypeScript", content: `Create a React component for {{component_name}} with TypeScript. Include props interface, hooks if needed, and basic styling.`, type: "TEXT", categorySlug: "web-development", tagSlugs: ["gpt-4", "advanced"], authorId: alice.id },
    { title: "API Documentation Writer", description: "Generate API documentation", content: `Write API documentation for {{endpoint}}:\n\nMethod: {{method}}\nParameters: {{params}}\nResponse: {{response}}\n\nInclude examples and error codes.`, type: "TEXT", categorySlug: "technical-writing", tagSlugs: ["gpt-4", "beginner"], authorId: alice.id },
    { title: "Social Media Content Calendar", description: "Plan social media content", content: `Create a {{duration}} social media content calendar for {{brand}} targeting {{audience}}. Include post ideas, hashtags, and best posting times.`, type: "TEXT", categorySlug: "marketing", tagSlugs: ["claude", "beginner"], authorId: alice.id },
    { title: "UX Research Questions", description: "Generate user research questions", content: `Create user research questions for {{product}} focusing on {{feature}}. Include open-ended, rating, and follow-up questions.`, type: "TEXT", categorySlug: "business", tagSlugs: ["gpt-4", "beginner"], authorId: alice.id },
    
    // Bob's prompts  
    { title: "SQL Query Optimizer", description: "Optimize SQL queries", content: `Analyze and optimize this SQL query:\n\n{{query}}\n\nProvide: execution plan analysis, index suggestions, and optimized query.`, type: "TEXT", categorySlug: "data-science", tagSlugs: ["gpt-4", "advanced"], authorId: bob.id },
    { title: "Docker Compose Generator", description: "Generate Docker Compose files", content: `Create a Docker Compose file for {{stack}} with {{services}}. Include environment variables, volumes, and networks.`, type: "TEXT", categorySlug: "devops", tagSlugs: ["gpt-4", "advanced"], authorId: bob.id },
    { title: "Job Description Writer", description: "Write compelling job descriptions", content: `Write a job description for {{position}} at {{company}}. Include responsibilities, requirements, benefits, and company culture.`, type: "TEXT", categorySlug: "hr", tagSlugs: ["claude", "beginner"], authorId: bob.id },
    { title: "Sales Email Sequence", description: "Create sales email sequences", content: `Create a {{length}}-email sequence for {{product}} targeting {{persona}}. Include subject lines, personalization, and CTAs.`, type: "TEXT", categorySlug: "sales", tagSlugs: ["gpt-4", "advanced"], authorId: bob.id },
    
    // Charlie's prompts
    { title: "Mobile App Onboarding Flow", description: "Design onboarding experiences", content: `Design an onboarding flow for {{app_name}} ({{platform}}). Include screens, copy, and user actions for first-time users.`, type: "TEXT", categorySlug: "mobile-development", tagSlugs: ["claude", "beginner"], authorId: charlie.id },
    { title: "Product Copywriter", description: "Compelling product copy", content: `Write product copy for {{product_name}}:\n\nFeatures: {{features}}\nTarget: {{target}}\n\nInclude headline, benefits, and CTA.`, type: "TEXT", categorySlug: "copywriting", tagSlugs: ["gpt-4", "beginner"], authorId: charlie.id },
    { title: "Meeting Notes Summarizer", description: "Summarize meeting notes", content: `Summarize this meeting:\n\n{{transcript}}\n\nProvide: key decisions, action items, owners, and deadlines.`, type: "TEXT", categorySlug: "business", tagSlugs: ["gpt-4", "beginner"], authorId: charlie.id },
    { title: "Music Prompt Generator", description: "Generate music with AI", content: `Create a {{genre}} track with {{mood}} feel. BPM: {{bpm}}, Key: {{key}}. Include intro, verse, chorus structure.`, type: "AUDIO", categorySlug: "music", tagSlugs: ["claude", "advanced"], authorId: charlie.id },
    
    // Structured prompts (workflows)
    { 
      title: "Content Pipeline Workflow", 
      description: "Multi-step content creation pipeline", 
      content: JSON.stringify({
        name: "Content Creation Pipeline",
        version: "1.0",
        steps: [
          {
            id: "research",
            name: "Research Topic",
            prompt: "Research the topic '{{topic}}' and provide 5 key points with sources",
            output: "research_results"
          },
          {
            id: "outline",
            name: "Create Outline",
            prompt: "Based on {{research_results}}, create a detailed blog post outline",
            output: "outline",
            depends_on: ["research"]
          },
          {
            id: "draft",
            name: "Write Draft",
            prompt: "Write a {{word_count}} word blog post following this outline: {{outline}}",
            output: "draft",
            depends_on: ["outline"]
          },
          {
            id: "review",
            name: "Review & Edit",
            prompt: "Review and improve this draft for clarity, grammar, and engagement: {{draft}}",
            output: "final_content",
            depends_on: ["draft"]
          }
        ],
        variables: {
          topic: { type: "string", required: true },
          word_count: { type: "number", default: 1500 }
        }
      }, null, 2), 
      type: "STRUCTURED", 
      structuredFormat: "JSON",
      categorySlug: "automations", 
      tagSlugs: ["workflow", "gpt-4", "advanced"], 
      authorId: admin.id 
    },
    { 
      title: "Code Review Agent", 
      description: "AI agent for comprehensive code reviews", 
      content: `name: Code Review Agent
version: "1.0"
description: Multi-pass code review agent

agent:
  role: Senior Software Engineer
  expertise:
    - Code quality
    - Security
    - Performance optimization
    - Best practices

workflow:
  - step: security_scan
    prompt: |
      Analyze this code for security vulnerabilities:
      \`\`\`{{language}}
      {{code}}
      \`\`\`
      Focus on: injection, XSS, authentication issues
    output: security_report

  - step: performance_review
    prompt: |
      Review this code for performance issues:
      {{code}}
      Consider: time complexity, memory usage, database queries
    output: performance_report
    depends_on: [security_scan]

  - step: best_practices
    prompt: |
      Check adherence to {{language}} best practices:
      {{code}}
    output: practices_report
    depends_on: [security_scan]

  - step: final_summary
    prompt: |
      Compile a final code review report from:
      - Security: {{security_report}}
      - Performance: {{performance_report}}
      - Best Practices: {{practices_report}}
    output: final_review
    depends_on: [performance_review, best_practices]

variables:
  code:
    type: string
    required: true
  language:
    type: string
    default: typescript`, 
      type: "STRUCTURED", 
      structuredFormat: "YAML",
      categorySlug: "agent-workflows", 
      tagSlugs: ["agent", "workflow", "claude", "advanced"], 
      authorId: demo.id 
    },
    { 
      title: "Customer Support Agent", 
      description: "Intelligent customer support workflow", 
      content: JSON.stringify({
        name: "Customer Support Agent",
        version: "1.0",
        agent: {
          role: "Customer Support Specialist",
          tone: "friendly, professional, helpful",
          constraints: [
            "Never share internal policies",
            "Escalate billing issues over $1000",
            "Always verify customer identity first"
          ]
        },
        workflow: [
          {
            step: "classify",
            prompt: "Classify this customer inquiry: {{inquiry}}\nCategories: billing, technical, general, complaint",
            output: "category"
          },
          {
            step: "gather_context",
            prompt: "What additional information is needed to resolve this {{category}} issue? List specific questions.",
            output: "followup_questions",
            depends_on: ["classify"]
          },
          {
            step: "resolve",
            prompt: "Provide a helpful response for this {{category}} issue: {{inquiry}}\nContext gathered: {{context}}",
            output: "response",
            depends_on: ["gather_context"]
          }
        ],
        variables: {
          inquiry: { type: "string", required: true },
          context: { type: "string", default: "" }
        }
      }, null, 2), 
      type: "STRUCTURED", 
      structuredFormat: "JSON",
      categorySlug: "agent-workflows", 
      tagSlugs: ["agent", "workflow", "gpt-4", "beginner"], 
      authorId: alice.id 
    },
    { 
      title: "Data Processing Pipeline", 
      description: "ETL-style data transformation workflow", 
      content: `name: Data Processing Pipeline
version: "1.0"
description: Transform and analyze data with AI

pipeline:
  - stage: extract
    name: Data Extraction
    prompt: |
      Extract structured data from this input:
      {{raw_data}}
      
      Output as JSON with fields: {{fields}}
    output: extracted_data

  - stage: transform
    name: Data Transformation
    prompt: |
      Transform this data according to rules:
      Data: {{extracted_data}}
      Rules: {{transformation_rules}}
    output: transformed_data
    depends_on: [extract]

  - stage: validate
    name: Data Validation
    prompt: |
      Validate this data against schema:
      Data: {{transformed_data}}
      Schema: {{validation_schema}}
      Report any errors or inconsistencies.
    output: validation_report
    depends_on: [transform]

  - stage: analyze
    name: Data Analysis
    prompt: |
      Analyze this validated data:
      {{transformed_data}}
      
      Provide: summary statistics, patterns, anomalies
    output: analysis_report
    depends_on: [validate]

variables:
  raw_data:
    type: string
    required: true
  fields:
    type: array
    default: [id, name, value, timestamp]
  transformation_rules:
    type: string
    default: "normalize dates, clean text, convert currencies"
  validation_schema:
    type: string
    default: "standard"`, 
      type: "STRUCTURED", 
      structuredFormat: "YAML",
      categorySlug: "automations", 
      tagSlugs: ["workflow", "claude", "advanced"], 
      authorId: bob.id 
    },
    
    // SKILL type prompts (Agent Skills)
    {
      title: "Code Refactoring Skill",
      description: "An agent skill for refactoring code to improve quality and maintainability",
      content: `# Code Refactoring Skill

This skill helps refactor code to improve readability, maintainability, and performance.

## Instructions

When asked to refactor code:

1. **Analyze the code structure** - Identify code smells, duplications, and areas for improvement
2. **Apply refactoring patterns** - Use appropriate design patterns and best practices
3. **Preserve functionality** - Ensure all existing behavior is maintained
4. **Add documentation** - Include clear comments explaining complex logic
5. **Optimize performance** - Look for opportunities to improve efficiency

## Guidelines

- Follow the language's style guide and conventions
- Break large functions into smaller, focused ones
- Use meaningful variable and function names
- Remove dead code and unused imports
- Add type annotations where applicable

## Output Format

Provide the refactored code with explanations of changes made.`,
      type: "SKILL",
      categorySlug: "coding",
      tagSlugs: ["skill", "copilot", "advanced"],
      authorId: admin.id
    },
    {
      title: "Test Generator Skill",
      description: "An agent skill for generating comprehensive unit tests",
      content: `# Test Generator Skill

This skill generates comprehensive unit tests for code.

## Instructions

When generating tests:

1. **Identify testable units** - Find functions, methods, and classes to test
2. **Cover edge cases** - Include tests for boundary conditions and error states
3. **Use appropriate assertions** - Match assertions to expected outcomes
4. **Mock dependencies** - Isolate units from external dependencies
5. **Follow naming conventions** - Use descriptive test names

## Test Categories

- **Happy path tests** - Normal expected behavior
- **Edge case tests** - Boundary conditions
- **Error handling tests** - Exception and error scenarios
- **Integration tests** - Component interactions

## Framework Guidelines

- Use the project's existing test framework
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated
- Aim for high code coverage`,
      type: "SKILL",
      categorySlug: "coding",
      tagSlugs: ["skill", "copilot", "beginner"],
      authorId: demo.id
    },
    {
      title: "Documentation Writer Skill",
      description: "An agent skill for generating comprehensive documentation",
      content: `# Documentation Writer Skill

This skill creates clear, comprehensive documentation for code and APIs.

## Instructions

When writing documentation:

1. **Understand the code** - Analyze functionality and purpose
2. **Write clear descriptions** - Explain what the code does in plain language
3. **Document parameters** - List all inputs with types and descriptions
4. **Include examples** - Provide usage examples for common scenarios
5. **Note edge cases** - Document any limitations or special behaviors

## Documentation Types

### Function/Method Documentation
- Purpose and description
- Parameters with types
- Return values
- Exceptions thrown
- Usage examples

### API Documentation
- Endpoint descriptions
- Request/response formats
- Authentication requirements
- Rate limits and errors

### README Documentation
- Project overview
- Installation instructions
- Quick start guide
- Configuration options`,
      type: "SKILL",
      categorySlug: "technical-writing",
      tagSlugs: ["skill", "copilot", "beginner"],
      authorId: alice.id
    },
    {
      title: "Git Commit Message Skill",
      description: "An agent skill for writing clear, conventional commit messages",
      content: `# Git Commit Message Skill

This skill writes clear, conventional commit messages following best practices.

## Instructions

When writing commit messages:

1. **Use conventional commit format** - type(scope): description
2. **Be concise but descriptive** - Summarize changes clearly
3. **Use imperative mood** - "Add feature" not "Added feature"
4. **Reference issues** - Link to relevant tickets or issues
5. **Separate concerns** - One logical change per commit

## Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## Format

\`\`\`
type(scope): short description

Longer description if needed. Explain what and why,
not how.

Refs: #issue-number
\`\`\``,
      type: "SKILL",
      categorySlug: "devops",
      tagSlugs: ["skill", "copilot", "beginner"],
      authorId: bob.id
    },
    {
      title: "Code Review Skill",
      description: "An agent skill for performing thorough code reviews",
      content: `# Code Review Skill

This skill performs comprehensive code reviews with actionable feedback.

## Instructions

When reviewing code:

1. **Check correctness** - Verify logic and functionality
2. **Review code style** - Ensure consistency with project standards
3. **Identify security issues** - Look for vulnerabilities
4. **Assess performance** - Find potential bottlenecks
5. **Evaluate maintainability** - Consider future maintenance

## Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate

### Code Quality
- [ ] Code is readable and well-organized
- [ ] Functions are focused and not too long
- [ ] No code duplication
- [ ] Variable names are descriptive

### Security
- [ ] Input validation is present
- [ ] No hardcoded secrets
- [ ] SQL injection prevention
- [ ] XSS prevention

## Feedback Format

Provide specific, actionable feedback with:
- Line references
- Suggested improvements
- Code examples when helpful`,
      type: "SKILL",
      categorySlug: "coding",
      tagSlugs: ["skill", "copilot", "advanced"],
      authorId: charlie.id
    },
  ];

  for (const promptData of prompts) {
    const category = categories.find((c) => c.slug === promptData.categorySlug);
    const promptTags = tags.filter((t) => promptData.tagSlugs.includes(t.slug));

    const existingPrompt = await prisma.prompt.findFirst({
      where: { title: promptData.title, authorId: promptData.authorId },
    });

    if (!existingPrompt) {
      const prompt = await prisma.prompt.create({
        data: {
          title: promptData.title,
          description: promptData.description,
          content: promptData.content,
          type: promptData.type as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "STRUCTURED" | "SKILL",
          structuredFormat: (promptData as { structuredFormat?: "JSON" | "YAML" }).structuredFormat,
          authorId: promptData.authorId,
          categoryId: category?.id,
          tags: {
            create: promptTags.map((tag) => ({ tagId: tag.id })),
          },
        },
      });

      // Create initial version
      await prisma.promptVersion.create({
        data: {
          promptId: prompt.id,
          version: 1,
          content: promptData.content,
          changeNote: "Initial version",
          createdBy: promptData.authorId,
        },
      });
    }
  }
  console.log("✅ Created", prompts.length, "prompts");

  // Create comprehensive change requests
  const allPrompts = await prisma.prompt.findMany();
  
  const changeRequestsData = [
    // Pending requests
    { id: "cr-1", promptTitle: "Code Review Assistant", authorId: demo.id, reason: "Added best practices section", proposedAddition: "\n\n6. **Best Practices**: Suggest industry best practices.", status: "PENDING" as const },
    { id: "cr-2", promptTitle: "Blog Post Generator", authorId: alice.id, reason: "Added SEO tips", proposedAddition: "\n\nInclude meta description and keyword suggestions.", status: "PENDING" as const },
    { id: "cr-3", promptTitle: "React Component Generator", authorId: bob.id, reason: "Add accessibility considerations", proposedAddition: "\n\nEnsure ARIA labels and keyboard navigation support.", status: "PENDING" as const },
    { id: "cr-4", promptTitle: "SQL Query Optimizer", authorId: charlie.id, reason: "Include explain analyze output", proposedAddition: "\n\nShow EXPLAIN ANALYZE output interpretation.", status: "PENDING" as const },
    { id: "cr-5", promptTitle: "Expert System Prompt", authorId: demo.id, reason: "Add error handling guidance", proposedAddition: "\n\nHandle edge cases gracefully and provide fallback responses.", status: "PENDING" as const },
    
    // Approved requests
    { id: "cr-6", promptTitle: "SWOT Analysis Generator", authorId: admin.id, reason: "Added competitive analysis section", proposedAddition: "\n\n## Competitive Position\nCompare against top 3 competitors.", status: "APPROVED" as const, reviewNote: "Great addition! Merged." },
    { id: "cr-7", promptTitle: "Debug Assistant", authorId: alice.id, reason: "Include stack trace analysis", proposedAddition: "\n\n6. Analyze the full stack trace if provided.", status: "APPROVED" as const, reviewNote: "Very helpful improvement." },
    { id: "cr-8", promptTitle: "Docker Compose Generator", authorId: demo.id, reason: "Add health checks", proposedAddition: "\n\nInclude healthcheck configurations for each service.", status: "APPROVED" as const, reviewNote: "Essential for production setups." },
    { id: "cr-9", promptTitle: "API Documentation Writer", authorId: bob.id, reason: "Add rate limiting info", proposedAddition: "\n\nDocument rate limits and throttling policies.", status: "APPROVED" as const, reviewNote: "Good call, this is often missing." },
    
    // Rejected requests  
    { id: "cr-10", promptTitle: "Midjourney Fantasy Landscape", authorId: admin.id, reason: "Simplify the prompt", proposedAddition: " (simplified)", status: "REJECTED" as const, reviewNote: "I prefer the detailed version for better results." },
    { id: "cr-11", promptTitle: "Sales Email Sequence", authorId: charlie.id, reason: "Make it more aggressive", proposedAddition: "\n\nBe more pushy and urgent.", status: "REJECTED" as const, reviewNote: "This goes against our brand voice guidelines." },
    { id: "cr-12", promptTitle: "Job Description Writer", authorId: alice.id, reason: "Remove benefits section", proposedAddition: "", status: "REJECTED" as const, reviewNote: "Benefits are important for attracting candidates." },
  ];

  for (const cr of changeRequestsData) {
    const prompt = allPrompts.find(p => p.title === cr.promptTitle);
    if (prompt) {
      await prisma.changeRequest.upsert({
        where: { id: cr.id },
        update: {},
        create: {
          id: cr.id,
          promptId: prompt.id,
          authorId: cr.authorId,
          originalContent: prompt.content,
          originalTitle: prompt.title,
          proposedContent: prompt.content + cr.proposedAddition,
          proposedTitle: null,
          reason: cr.reason,
          status: cr.status,
          reviewNote: cr.reviewNote || null,
        },
      });
    }
  }

  console.log("✅ Created", changeRequestsData.length, "change requests");

  // Create prompt connections (chains)
  const connectionPromptTitles = [
    "Code Review Assistant",
    "Code Refactoring Skill",
    "Test Generator Skill",
    "Documentation Writer Skill",
    "Git Commit Message Skill",
    "Code Review Skill",
    "Debug Assistant",
    "Content Pipeline Workflow",
    "Blog Post Generator",
  ];

  const connectionPrompts = await prisma.prompt.findMany({
    where: { title: { in: connectionPromptTitles } },
  });

  const getPromptByTitle = (title: string) => connectionPrompts.find(p => p.title === title);

  const promptConnectionsData = [
    // Code review workflow chain
    {
      sourceTitle: "Code Review Assistant",
      targetTitle: "Code Refactoring Skill",
      label: "needs refactoring",
      order: 0,
    },
    {
      sourceTitle: "Code Review Assistant",
      targetTitle: "Test Generator Skill",
      label: "needs tests",
      order: 1,
    },
    {
      sourceTitle: "Code Refactoring Skill",
      targetTitle: "Code Review Skill",
      label: "review changes",
      order: 0,
    },
    {
      sourceTitle: "Code Refactoring Skill",
      targetTitle: "Documentation Writer Skill",
      label: "update docs",
      order: 1,
    },
    {
      sourceTitle: "Test Generator Skill",
      targetTitle: "Code Review Skill",
      label: "review tests",
      order: 0,
    },
    // After code review, commit
    {
      sourceTitle: "Code Review Skill",
      targetTitle: "Git Commit Message Skill",
      label: "ready to commit",
      order: 0,
    },
    // Debug workflow
    {
      sourceTitle: "Debug Assistant",
      targetTitle: "Code Refactoring Skill",
      label: "fix identified",
      order: 0,
    },
    {
      sourceTitle: "Debug Assistant",
      targetTitle: "Test Generator Skill",
      label: "add regression test",
      order: 1,
    },
    // Content workflow chain
    {
      sourceTitle: "Content Pipeline Workflow",
      targetTitle: "Blog Post Generator",
      label: "generate content",
      order: 0,
    },
  ];

  let connectionsCreated = 0;
  for (const conn of promptConnectionsData) {
    const source = getPromptByTitle(conn.sourceTitle);
    const target = getPromptByTitle(conn.targetTitle);

    if (source && target) {
      await prisma.promptConnection.upsert({
        where: {
          sourceId_targetId: {
            sourceId: source.id,
            targetId: target.id,
          },
        },
        update: {},
        create: {
          sourceId: source.id,
          targetId: target.id,
          label: conn.label,
          order: conn.order,
        },
      });
      connectionsCreated++;
    }
  }

  console.log("✅ Created", connectionsCreated, "prompt connections");

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test credentials (all passwords: password123):");
  console.log("   Admin:   admin@prompts.chat");
  console.log("   Demo:    demo@prompts.chat");
  console.log("   Alice:   alice@example.com");
  console.log("   Bob:     bob@example.com");
  console.log("   Charlie: charlie@example.com");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
