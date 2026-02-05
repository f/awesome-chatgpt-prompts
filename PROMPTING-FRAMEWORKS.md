# Prompting Frameworks Guide

> A comprehensive guide to the top 15 prompt engineering frameworks for ChatGPT, Claude, Gemini, and other AI models. Each framework includes a template and 3 practical examples.

---

## Table of Contents

1. [RTF (Role-Task-Format)](#1-rtf-role-task-format)
2. [RISEN (Role-Instruction-Structure-Examples-Nuance)](#2-risen-role-instruction-structure-examples-nuance)
3. [CO-STAR (Context-Objective-Style-Tone-Audience-Response)](#3-co-star-context-objective-style-tone-audience-response)
4. [CRISPE (Capacity-Role-Insight-Statement-Personality-Experiment)](#4-crispe-capacity-role-insight-statement-personality-experiment)
5. [APE (Action-Purpose-Expectation)](#5-ape-action-purpose-expectation)
6. [RACE (Role-Action-Context-Expectations)](#6-race-role-action-context-expectations)
7. [ROSES (Role-Objective-Scenario-Expected Solution-Steps)](#7-roses-role-objective-scenario-expected-solution-steps)
8. [RASCEF (Role-Action-Steps-Context-Examples-Format)](#8-rascef-role-action-steps-context-examples-format)
9. [Chain of Thought (CoT)](#9-chain-of-thought-cot)
10. [TAG (Task-Action-Goal)](#10-tag-task-action-goal)
11. [BAB (Before-After-Bridge)](#11-bab-before-after-bridge)
12. [CARE (Context-Action-Result-Example)](#12-care-context-action-result-example)
13. [SCAMPER (Substitute-Combine-Adapt-Modify-Put to other uses-Eliminate-Reverse)](#13-scamper-substitute-combine-adapt-modify-put-to-other-uses-eliminate-reverse)
14. [TRACE (Task-Request-Action-Context-Example)](#14-trace-task-request-action-context-example)
15. [ERA (Expectation-Role-Action)](#15-era-expectation-role-action)

---

## 1. RTF (Role-Task-Format)

**Best for:** Quick, straightforward prompts and beginners

The RTF framework is the simplest and most versatile framework. It's the "jack-of-all-trades" that works for most use cases.

### Template

```
**Role:** [Who should the AI act as]
**Task:** [What you want the AI to do]
**Format:** [How the output should be structured]
```

### Example 1: Marketing Copy

```
**Role:** You are a senior copywriter at a top advertising agency with 15 years of experience in digital marketing.

**Task:** Write a compelling product description for a new eco-friendly water bottle made from recycled ocean plastic.

**Format:** Provide the description in 3 paragraphs: 1) Hook with emotional appeal, 2) Product features and benefits, 3) Call to action. Keep it under 200 words total.
```

### Example 2: Code Review

```
**Role:** You are a senior software engineer specializing in Python with expertise in clean code principles and security best practices.

**Task:** Review the following Python function for potential bugs, security vulnerabilities, and performance issues.

**Format:** Structure your review as:
- Summary (1-2 sentences)
- Critical Issues (if any)
- Suggestions for Improvement
- Refactored Code Example
```

### Example 3: Educational Content

```
**Role:** You are an experienced high school physics teacher known for making complex concepts accessible to students.

**Task:** Explain quantum entanglement to a 16-year-old student who has basic knowledge of classical physics.

**Format:** Use a conversational tone with:
- A relatable analogy
- The core concept in simple terms
- A real-world application
- A thought-provoking question to encourage further learning
```

---

## 2. RISEN (Role-Instruction-Structure-Examples-Nuance)

**Best for:** Precise, repeatable prompts across technical, business, and creative use cases

The RISEN framework ensures clarity and consistency by breaking down prompts into five key components. Created by Kyle Balmer.

### Template

```
**Role:** [Define the AI's expertise or persona]
**Instruction:** [Clear, actionable steps using verbs]
**Structure:** [Specify output format: list, table, paragraphs, etc.]
**Examples:** [Provide sample outputs to guide the AI]
**Nuance:** [Set constraints: length, tone, style, exclusions]
```

### Example 1: Nutritional Planning

```
**Role:** You are a certified nutritionist with specialization in plant-based diets.

**Instruction:** Create a 7-day meal plan for someone transitioning to a vegetarian diet who needs 2000 calories per day and has a nut allergy.

**Structure:** Present as a table with columns: Day, Breakfast, Lunch, Dinner, Snacks, Total Calories, Protein (g).

**Examples:**
- Day 1 Breakfast: Overnight oats with chia seeds, berries, and coconut yogurt (350 cal, 12g protein)

**Nuance:**
- Prioritize whole foods over processed alternatives
- Include at least 60g of protein per day
- Avoid exotic ingredients; use commonly available items
- Keep each meal prep under 30 minutes
```

### Example 2: Technical Documentation

```
**Role:** You are a technical writer with 10 years of experience documenting APIs for developer audiences.

**Instruction:** Write documentation for a REST API endpoint that creates a new user account.

**Structure:**
1. Endpoint Overview
2. Request (method, URL, headers, body with field descriptions)
3. Response (success and error examples)
4. Code Examples (cURL, Python, JavaScript)
5. Common Errors table

**Examples:**
```json
POST /api/v1/users
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Nuance:**
- Use concise, scannable language
- Avoid jargon; define technical terms on first use
- Include rate limiting information
- Keep total length under 800 words
```

### Example 3: Market Research Summary

```
**Role:** You are a market research analyst at a Fortune 500 consulting firm.

**Instruction:** Analyze the electric vehicle market trends for 2025 and provide strategic recommendations for a traditional automaker.

**Structure:**
1. Executive Summary (3 bullet points)
2. Market Overview (current size, growth rate)
3. Key Trends (numbered list)
4. Competitive Landscape (table format)
5. Strategic Recommendations (prioritized list)

**Examples:**
- Trend: "Battery costs decreased 15% YoY, enabling price parity with ICE vehicles by 2026"

**Nuance:**
- Focus on North American and European markets
- Exclude luxury segment analysis
- Use data from 2023-2025 only
- Maintain neutral, objective tone
- Maximum 600 words
```

---

## 3. CO-STAR (Context-Objective-Style-Tone-Audience-Response)

**Best for:** Content creation, marketing, and communications requiring specific voice

Developed by GovTech Singapore, CO-STAR won Singapore's first GPT-4 Prompt Engineering competition. It ensures all key aspects influencing an LLM's response are considered.

### Template

```
**Context:** [Background information about the situation]
**Objective:** [The specific task or goal]
**Style:** [Writing style to emulate]
**Tone:** [Emotional quality of the response]
**Audience:** [Who will read/use this output]
**Response:** [Desired format and structure]
```

### Example 1: Non-Profit Email Campaign

```
**Context:** Our environmental non-profit just completed a beach cleanup that removed 5 tons of plastic from local coastlines. We have photos and volunteer testimonials. Our donor base includes 10,000 subscribers who have given previously.

**Objective:** Write an email that celebrates the achievement and encourages additional donations for our next cleanup event.

**Style:** Similar to Charity: Water's storytelling approach—narrative-driven with impact metrics.

**Tone:** Inspiring, grateful, and urgent without being pushy.

**Audience:** Existing donors aged 35-55 who care about environmental causes and have disposable income for charitable giving.

**Response:**
- Subject line (A/B test two options)
- Email body (300 words max)
- Clear CTA button text
- P.S. line for urgency
```

### Example 2: Internal Company Announcement

```
**Context:** Our tech company is implementing a 4-day work week pilot program starting next quarter. This affects 500 employees across 3 offices. The decision came after 6 months of research and employee surveys showing 78% support.

**Objective:** Announce the pilot program and explain how it will work, addressing potential concerns proactively.

**Style:** Professional corporate communication like Microsoft or Salesforce internal memos.

**Tone:** Enthusiastic but measured, acknowledging this is experimental.

**Audience:** All employees—ranging from engineers to sales to HR—with varying levels of flexibility in their current roles.

**Response:**
- Slack announcement (150 words)
- FAQ section with 5 anticipated questions
- Timeline graphic description
```

### Example 3: Product Launch Blog Post

```
**Context:** We're launching a new AI-powered writing assistant that helps non-native English speakers improve their business emails. It costs $9.99/month and integrates with Gmail and Outlook. Beta testing showed 40% improvement in email clarity scores.

**Objective:** Write a blog post announcing the product launch that drives sign-ups for the free trial.

**Style:** Conversational tech blog style similar to Buffer or Zapier's blogs—friendly, practical, benefit-focused.

**Tone:** Helpful and encouraging, not salesy or condescending about language skills.

**Audience:** International professionals (primarily in tech, finance, consulting) who communicate in English daily but aren't native speakers.

**Response:**
- Headline and subheadline
- Blog post (500-700 words)
- 3 pull quotes for social media
- Meta description for SEO
```

---

## 4. CRISPE (Capacity-Role-Insight-Statement-Personality-Experiment)

**Best for:** Creative work, brainstorming, and generating multiple variations

CRISPE is excellent for testing creative angles, different variables, and gathering multiple ideas.

### Template

```
**Capacity & Role:** [The expertise and persona the AI should embody]
**Insight:** [Background information and context]
**Statement:** [The main task or question]
**Personality:** [Tone, style, and voice characteristics]
**Experiment:** [Request for variations or multiple options]
```

### Example 1: Brand Tagline Creation

```
**Capacity & Role:** You are a creative director at a branding agency who has developed memorable taglines for Nike, Apple, and Airbnb.

**Insight:** Our client is a sustainable fashion startup targeting Gen Z consumers. They use only recycled materials and pay fair wages. Their competitors include Patagonia, Everlane, and Reformation. Current brand perception is "ethical but boring."

**Statement:** Create taglines that position the brand as both sustainable AND stylish/exciting.

**Personality:** Bold, youthful, slightly irreverent—think Oatly's marketing voice but for fashion.

**Experiment:** Provide 5 different tagline directions:
1. Humor-forward
2. Aspirational
3. Challenge/provocative
4. Emotional connection
5. Wordplay/clever
For each, explain the strategic rationale in one sentence.
```

### Example 2: Video Script Concepts

```
**Capacity & Role:** You are a viral video producer who has created content with 100M+ views for brands like Dollar Shave Club and Old Spice.

**Insight:** We're marketing a mobile app that helps people split bills at restaurants. Our target audience is 22-30 year olds who frequently dine out with friends. Pain points: awkwardness of asking for money, Venmo request fatigue, math anxiety.

**Statement:** Develop concepts for a 30-second video ad for TikTok/Instagram Reels.

**Personality:** Funny, relatable, self-aware about millennial/Gen Z culture and dining habits.

**Experiment:** Give me 3 completely different creative directions:
1. Scenario-based comedy
2. Unexpected twist/subversion
3. Trending format adaptation
Include a one-line hook, basic scene description, and suggested audio/music for each.
```

### Example 3: Workshop Facilitation Design

```
**Capacity & Role:** You are an innovation consultant who has facilitated design thinking workshops for Google, IDEO, and Stanford d.school.

**Insight:** A mid-size bank (2,000 employees) wants to improve their mobile banking app. They've never done user-centered design. Participants will include developers, product managers, and 2 executives. Workshop is 4 hours, in-person, with 15 participants.

**Statement:** Design engaging workshop activities that will generate actionable insights and get executive buy-in.

**Personality:** Energetic and accessible—avoid jargon, make executives comfortable with "play."

**Experiment:** Propose 3 different workshop structures:
1. Traditional design thinking flow
2. Gamified competition approach
3. Customer journey deep-dive
For each, list activities with time allocations and materials needed.
```

---

## 5. APE (Action-Purpose-Expectation)

**Best for:** Quick tasks, beginners, and 80% of everyday prompts

APE is beginner-friendly and focuses on clarity of intent. It transforms vague requests into actionable instructions.

### Template

```
**Action:** [The specific task—use strong action verbs]
**Purpose:** [Why this task matters—the underlying goal]
**Expectation:** [The desired outcome and format]
```

### Example 1: Meeting Summary

```
**Action:** Summarize the following meeting transcript, extracting key decisions and action items.

**Purpose:** I need to share this with team members who couldn't attend and ensure nothing falls through the cracks.

**Expectation:** Provide:
- 3-5 bullet point summary of main discussion topics
- Table of action items with columns: Task, Owner, Deadline
- Any unresolved questions that need follow-up
Keep the entire summary under 300 words.
```

### Example 2: Resume Optimization

```
**Action:** Rewrite my resume bullet points to be more impactful using the STAR method (Situation, Task, Action, Result).

**Purpose:** I'm applying for senior product manager roles at tech companies and need to better quantify my achievements.

**Expectation:** For each bullet point I provide:
- Identify what's weak about the current version
- Rewrite with specific metrics and stronger action verbs
- Suggest a power verb from this list: Spearheaded, Orchestrated, Transformed, Accelerated, Championed

Current bullet: "Managed a team and launched new features"
```

### Example 3: Competitive Analysis

```
**Action:** Analyze the pricing strategies of these three SaaS competitors: Notion, Coda, and Airtable.

**Purpose:** We're launching a competing product and need to position our pricing competitively while maintaining profitability.

**Expectation:**
- Comparison table with tiers, prices, and key features at each level
- Analysis of each company's apparent strategy (penetration, premium, freemium, etc.)
- Identification of gaps or opportunities in the market
- Recommendation for our pricing approach with rationale
```

---

## 6. RACE (Role-Action-Context-Expectations)

**Best for:** Expert-level outputs and specialized professional advice

RACE is designed for obtaining responses that mimic the expertise, methodology, and communication style of domain experts.

### Template

```
**Role:** [Specific professional identity with credentials]
**Action:** [Detailed task description]
**Context:** [Relevant background, constraints, and situation]
**Expectations:** [Quality standards and output requirements]
```

### Example 1: Legal Document Review

```
**Role:** You are a corporate attorney with 15 years of experience in SaaS contracts and data privacy law, including GDPR and CCPA compliance.

**Action:** Review this Terms of Service agreement and identify potential legal risks and areas that need strengthening.

**Context:** We're a B2B SaaS startup handling sensitive customer data. We serve clients in the US and EU. We've had no legal issues so far but are preparing for enterprise clients who will scrutinize our terms. Budget constraints mean we can't hire outside counsel for every review.

**Expectations:**
- Flag clauses that are problematic with severity ratings (High/Medium/Low)
- Explain each issue in plain English (not legalese)
- Provide suggested revised language for high-priority items
- Note any missing clauses that enterprise clients typically require
- Disclaimer that this is not legal advice
```

### Example 2: Financial Planning Advice

```
**Role:** You are a Certified Financial Planner (CFP) with expertise in retirement planning for high-income professionals in their 30s-40s.

**Action:** Create a comprehensive financial planning framework for early retirement (target age 50).

**Context:** Client profile: 38-year-old software engineer, $250K annual income, $400K in 401(k), $100K in taxable brokerage, $50K emergency fund, no debt, single, lives in a high cost-of-living city. Risk tolerance is moderate. Wants to retire by 50 but maintain current lifestyle ($8K/month expenses).

**Expectations:**
- Gap analysis: What's needed vs. what they have
- Year-by-year savings targets
- Asset allocation recommendation with rationale
- Tax optimization strategies (Roth conversion ladder, etc.)
- Sensitivity analysis: What if they can only save 50% of target?
- Key milestones and decision points
```

### Example 3: Medical Research Synthesis

```
**Role:** You are a clinical researcher with a PhD in epidemiology and experience conducting systematic reviews for Cochrane.

**Action:** Synthesize the current evidence on intermittent fasting for Type 2 diabetes management.

**Context:** This is for a patient education handout at an endocrinology clinic. Patients are adults with Type 2 diabetes who are curious about intermittent fasting but need balanced, evidence-based information. Many are on metformin or insulin.

**Expectations:**
- Summary of evidence quality (number of RCTs, sample sizes, study limitations)
- Key findings on blood sugar control, weight loss, and medication requirements
- Safety considerations and contraindications
- Practical implementation guidance if appropriate
- Clear statement of what we don't know yet
- Plain language suitable for patients (8th-grade reading level)
- Citations to major studies (author, year) without full references
```

---

## 7. ROSES (Role-Objective-Scenario-Expected Solution-Steps)

**Best for:** Complex requests requiring detailed, structured responses

ROSES helps communicate problems and how you want them approached in a detailed way.

### Template

```
**Role:** [Who is performing the action or whose perspective]
**Objective:** [What you hope to achieve]
**Scenario:** [The context or situation]
**Expected Solution:** [Type of response or result expected]
**Steps:** [Process or actions to follow]
```

### Example 1: Crisis Communication Plan

```
**Role:** You are a crisis communications director who has managed PR for Fortune 500 companies during product recalls, data breaches, and executive scandals.

**Objective:** Develop a crisis communication response plan for a data breach that exposed 100,000 customer email addresses and hashed passwords.

**Scenario:** We're a mid-size e-commerce company. The breach was discovered internally 24 hours ago. No financial data was exposed. We've patched the vulnerability. Media hasn't picked up the story yet. We have 100,000 affected customers and 50,000 social media followers. Our CEO is available but not media-trained.

**Expected Solution:** A comprehensive 72-hour action plan with specific messaging, channel strategy, and stakeholder management.

**Steps:**
1. Assess immediate notification requirements (legal obligations)
2. Develop holding statement for media inquiries
3. Draft customer notification email
4. Create FAQ for customer service team
5. Prepare social media response protocol
6. Outline CEO talking points if media escalation occurs
7. Define success metrics for crisis response
```

### Example 2: Product Launch Strategy

```
**Role:** You are a product marketing manager who has launched multiple successful B2B SaaS products from $0 to $10M ARR.

**Objective:** Create a go-to-market strategy for a new AI-powered customer support tool targeting mid-market companies.

**Scenario:** The product is feature-complete and in beta with 10 customers. We have $500K marketing budget for launch. Sales team of 5 SDRs and 3 AEs. The market has established players (Zendesk, Intercom) but our AI capabilities are genuinely differentiated. Target ICP: Director of Customer Success at companies with 50-500 employees.

**Expected Solution:** A 90-day launch plan with specific tactics, budget allocation, and KPIs.

**Steps:**
1. Define launch phases (soft launch, public launch, scale)
2. Identify key messaging and positioning against competitors
3. Outline channel strategy with budget breakdown
4. Create sales enablement requirements
5. Define launch metrics and targets for each phase
6. Identify risks and mitigation strategies
7. Build weekly execution timeline
```

### Example 3: Employee Onboarding Redesign

```
**Role:** You are a People Operations leader who has built onboarding programs at fast-growing startups that achieved 90%+ new hire satisfaction scores.

**Objective:** Redesign our onboarding program to reduce time-to-productivity from 90 days to 60 days while improving new hire retention.

**Scenario:** We're a 200-person tech company growing 50% annually. Current onboarding is ad-hoc—each team does their own thing. New hires report feeling lost after week 1. We have no dedicated onboarding budget but can allocate HR team time. Mix of remote and in-office employees across 3 time zones.

**Expected Solution:** A structured 60-day onboarding program framework that can scale with our growth.

**Steps:**
1. Map the ideal new hire journey week by week
2. Identify must-have vs. nice-to-have elements
3. Define roles and responsibilities (HR, manager, buddy, new hire)
4. Create measurement framework for success
5. Address remote vs. in-office considerations
6. Outline required tools and resources
7. Propose pilot approach for implementation
```

---

## 8. RASCEF (Role-Action-Steps-Context-Examples-Format)

**Best for:** Technical documentation, instructional design, and complex analytical reports

RASCEF provides comprehensive guidance for tasks requiring detailed, step-by-step outputs.

### Template

```
**Role:** [AI's assumed identity or function]
**Action:** [Task or objective to achieve]
**Steps:** [Sequence of actions or guidelines]
**Context:** [Background information relevant to the task]
**Examples:** [Concrete illustrations of desired output]
**Format:** [Desired output structure]
```

### Example 1: Standard Operating Procedure

```
**Role:** You are a process improvement specialist who creates SOPs for ISO 9001-certified manufacturing companies.

**Action:** Write a Standard Operating Procedure for the customer complaint handling process.

**Steps:**
1. Document the complaint intake process
2. Define escalation criteria and paths
3. Establish investigation procedures
4. Outline resolution protocols
5. Specify documentation requirements
6. Define follow-up and closure criteria

**Context:** Mid-size electronics manufacturer with 500 employees. Receive ~50 complaints/month through email, phone, and web form. Current process is inconsistent across shifts. Need to comply with ISO 9001:2015 requirements. Three-tier support structure exists (frontline, supervisor, quality manager).

**Examples:**
- Escalation trigger: "If complaint involves safety concern or potential recall, escalate immediately to Quality Manager regardless of time"
- Documentation: "Log complaint in CRM within 2 hours of receipt with fields: Date, Customer ID, Product SKU, Issue Category, Description, Severity (1-5)"

**Format:**
1. Purpose and Scope
2. Definitions
3. Responsibilities (RACI matrix)
4. Procedure (numbered steps with decision points)
5. Escalation Matrix (table)
6. Documentation Requirements
7. Revision History
```

### Example 2: Technical Tutorial

```
**Role:** You are a senior DevOps engineer who writes tutorials for DigitalOcean and AWS documentation.

**Action:** Write a tutorial for setting up a CI/CD pipeline using GitHub Actions for a Node.js application.

**Steps:**
1. Explain prerequisites and initial setup
2. Create the workflow file structure
3. Configure build and test stages
4. Add deployment to staging environment
5. Implement production deployment with approval gate
6. Add notifications and monitoring

**Context:** Target audience is developers with basic Git knowledge but no CI/CD experience. Application uses Node.js 18, PostgreSQL, and deploys to AWS ECS. Team size is 5 developers who currently deploy manually via SSH.

**Examples:**
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
```
- Command explanation: "npm ci is preferred over npm install in CI environments because it provides faster, more reliable builds"

**Format:**
- Introduction (why CI/CD matters)
- Prerequisites checklist
- Step-by-step instructions with code blocks
- Screenshots or diagram descriptions where helpful
- Troubleshooting section (common errors and fixes)
- Next steps for advanced configuration
```

### Example 3: Research Analysis Report

```
**Role:** You are a UX researcher who has conducted usability studies for Google, Meta, and Microsoft.

**Action:** Analyze the following usability test results and provide actionable recommendations.

**Steps:**
1. Synthesize findings across all participants
2. Identify patterns and severity of issues
3. Prioritize issues by impact and effort
4. Generate specific, actionable recommendations
5. Suggest metrics for measuring improvement

**Context:** E-commerce checkout flow redesign. 8 participants completed moderated usability tests. Mix of mobile (5) and desktop (3) users. Test tasks: add to cart, apply promo code, complete purchase. Success rate was 62%, down from industry benchmark of 85%. Average task time was 4.5 minutes vs. target of 2 minutes.

**Examples:**
- Finding format: "6/8 participants struggled to locate the promo code field, with 3 abandoning the task. P4 said: 'I know I have a code somewhere but I can't figure out where to put it.'"
- Recommendation format: "Move promo code field above order summary [HIGH PRIORITY]. Effort: Low (2 hours dev). Impact: Addresses 75% of observed friction."

**Format:**
1. Executive Summary (5 bullet points)
2. Methodology Overview
3. Key Findings (grouped by severity)
4. Prioritized Recommendations (table: Issue, Recommendation, Priority, Effort, Impact)
5. Participant Quotes (supporting evidence)
6. Appendix: Individual participant performance
```

---

## 9. Chain of Thought (CoT)

**Best for:** Complex reasoning, math problems, logic puzzles, and multi-step analysis

Chain of Thought prompting guides the AI through step-by-step reasoning, significantly improving accuracy on complex tasks.

### Template

**Zero-Shot CoT:**
```
[Your question or problem]

Let's think through this step-by-step.
```

**Few-Shot CoT:**
```
[Example problem 1]
Let's solve this step by step:
[Step-by-step reasoning]
[Answer]

[Example problem 2]
Let's solve this step by step:
[Step-by-step reasoning]
[Answer]

[Your actual problem]
Let's solve this step by step:
```

### Example 1: Business Decision Analysis (Zero-Shot)

```
We're deciding whether to build a feature in-house or buy a third-party solution.

Build option: 3 engineers for 4 months, $150K fully-loaded cost per engineer, 20% risk of delay, ongoing maintenance of 0.5 engineer.

Buy option: $50K/year license, 2 weeks integration, 1 engineer for 1 month, vendor has 95% uptime SLA.

Our planning horizon is 3 years. Engineering time could otherwise be spent on revenue-generating features worth approximately $500K in projected revenue.

Which option should we choose?

Let's think through this step-by-step, considering total cost of ownership, opportunity cost, and risk factors.
```

### Example 2: Debugging Logic (Few-Shot)

```
I'll show you how to debug code systematically, then you help me with my problem.

**Example 1:**
Bug: Function returns wrong total for shopping cart.
Code: `total = sum(item.price for item in cart)`

Step-by-step debugging:
1. First, check if the basic logic is correct: summing prices seems right
2. Consider edge cases: what if cart is empty? Returns 0, which is correct
3. Check data types: what if item.price is a string? Would cause type error, not wrong result
4. Consider missing factors: taxes? Discounts? Quantity?
5. Found it: quantity is not considered!
Fix: `total = sum(item.price * item.quantity for item in cart)`

**Example 2:**
Bug: User authentication always fails even with correct password.
Code: `if password == stored_password: return True`

Step-by-step debugging:
1. Basic logic check: direct comparison seems correct
2. Check if password is being received: add logging to confirm input
3. Check stored_password retrieval: verify it's fetching correct user's password
4. Consider encoding: passwords should be hashed, not stored in plain text
5. Found it: comparing plain text password to hashed stored password!
Fix: `if hash_password(password) == stored_password: return True`

**Now my problem:**
Bug: My date filter shows no results even when matching dates exist in database.
Code: `events = db.query(Event).filter(Event.date == selected_date).all()`
Database has events with dates like "2025-01-15", and selected_date is a Python datetime object for the same date.

Let's debug this step by step:
```

### Example 3: Strategic Planning (Zero-Shot)

```
Our startup has $500K runway remaining and 8 months of burn rate at current spending ($62.5K/month). We have 3 options:

A) Continue current strategy: Growing 10% month-over-month, might reach profitability in 12 months
B) Cut costs by 40%: Extends runway to 13 months but may slow growth to 5% MoM
C) Raise bridge round: Take $300K SAFE at $5M cap, diluting founders by 6%

Current MRR: $15K
Team: 5 people
We previously raised $1M at $4M post-money valuation.

Analyze which option is best for long-term company success.

Let's work through this systematically, examining each option's implications on runway, growth trajectory, team morale, future fundraising, and probability of success.
```

---

## 10. TAG (Task-Action-Goal)

**Best for:** Outcome-oriented interactions with clear deliverables

TAG focuses on what needs to be done and why, making it ideal for goal-driven requests.

### Template

```
**Task:** [What needs to be accomplished]
**Action:** [Specific steps or approach to take]
**Goal:** [The desired end result or outcome]
```

### Example 1: Sales Email Sequence

```
**Task:** Create a 5-email nurture sequence for leads who downloaded our whitepaper on "AI in Supply Chain Management."

**Action:**
- Email 1: Thank them and highlight one key insight from the whitepaper
- Email 2: Share a relevant case study 3 days later
- Email 3: Address common objections or concerns
- Email 4: Offer a free consultation or demo
- Email 5: Final follow-up with urgency element

**Goal:** Move cold leads to book a demo call, targeting 15% email-to-demo conversion rate. Tone should be consultative, not pushy—we're selling to VP-level supply chain executives who are skeptical of AI hype.
```

### Example 2: Content Repurposing

```
**Task:** Repurpose our 2,000-word blog post on "Remote Work Best Practices" into multiple content formats.

**Action:**
- Extract 10 key insights from the blog post
- Transform into formats for different platforms
- Maintain consistent messaging while adapting to each platform's style

**Goal:** Create a content package that includes:
- 5 LinkedIn posts (150-200 words each)
- 10 tweets/X posts (under 280 characters)
- 1 infographic outline with data points
- 1 email newsletter version (400 words)
- 3 Instagram carousel slides with text

All pieces should drive traffic back to the original blog post.
```

### Example 3: Competitive Response Strategy

```
**Task:** Develop a response strategy for a competitor's new feature announcement that directly targets our core value proposition.

**Action:**
- Analyze the competitor's announcement for strengths and weaknesses
- Identify our genuine differentiators that still stand
- Create talking points for sales team
- Draft customer communication addressing concerns
- Outline product roadmap response options

**Goal:** Arm our sales and customer success teams to confidently handle questions about the competitive threat within 24 hours. Minimize customer churn risk and maintain our win rate in competitive deals. Be honest about where they've caught up while highlighting where we're still ahead.
```

---

## 11. BAB (Before-After-Bridge)

**Best for:** Storytelling, marketing copy, and persuasive content

BAB frames problems in a before-and-after narrative, using the "Bridge" to explain the transformation.

### Template

```
**Before:** [Current situation/problem/pain point]
**After:** [Desired future state/solution achieved]
**Bridge:** [How to get from Before to After—your solution]
```

### Example 1: Product Landing Page

```
Write landing page copy using the BAB framework:

**Before:** Marketing teams spend 15+ hours per week manually creating reports from scattered data sources. They're always behind, executives are frustrated with outdated numbers, and strategic decisions are made on gut feeling instead of data.

**After:** Marketing leaders walk into Monday meetings with real-time dashboards already prepared. Every campaign's ROI is visible instantly. They're seen as strategic partners, not report-generating machines. They finally have time for the creative work they were hired to do.

**Bridge:** MarketingMetrics AI automatically connects to all your data sources, builds beautiful reports while you sleep, and learns your team's preferences to highlight insights that matter. Setup takes 10 minutes. See the impact in your first week.

Write 3 variations of this concept: one emphasizing time savings, one emphasizing career impact, one emphasizing data accuracy.
```

### Example 2: Case Study Narrative

```
Structure this customer success story using BAB:

**Before:** Acme Corp's customer support team was drowning. 2,000 tickets per day, 72-hour average response time, CSAT score of 2.1/5. They'd tried hiring more agents (expensive, slow to train) and chatbots (customers hated them). The VP of Support was worried about her job.

**After:** Six months later: same ticket volume handled by 30% fewer agents. Response time under 4 hours. CSAT score of 4.4/5. Support became a profit center through upsells. The VP got promoted.

**Bridge:** [Your product/solution] — explain the implementation journey, the key moments of transformation, and specific features that drove each improvement.

Write this as a 600-word case study with a compelling narrative arc. Include a customer quote (make it realistic and specific, not generic praise).
```

### Example 3: Change Management Communication

```
Help me communicate an unpopular policy change using BAB to build understanding and acceptance:

**Before:** Our current unlimited PTO policy sounds great but creates real problems. Only 40% of employees take more than 2 weeks off. Managers feel awkward approving requests. High performers feel guilty taking time. Burnout is increasing—our engagement scores show it.

**After:** With our new structured PTO (4 weeks mandatory minimum, 6 weeks maximum), everyone takes real vacations. There's no ambiguity or guilt. Managers actively encourage time off. Our team comes back refreshed and does their best work.

**Bridge:** We're implementing this change because we genuinely care about sustainable high performance. Here's how it works, why we made specific decisions, and how we'll transition over the next quarter.

Write an internal announcement email (400 words) and manager FAQ (5 questions) using this framework.
```

---

## 12. CARE (Context-Action-Result-Example)

**Best for:** Problem-solving, evaluations, and strategy development

CARE emphasizes clarity and actionable insights with demonstrative examples.

### Template

```
**Context:** [Background information and situation]
**Action:** [What needs to be done]
**Result:** [Expected outcome or deliverable]
**Example:** [Sample or reference point]
```

### Example 1: Performance Review Feedback

```
**Context:** I need to write a performance review for a mid-level engineer who has strong technical skills but struggles with communication and cross-team collaboration. They've been on the team for 2 years and are up for senior promotion consideration.

**Action:** Help me write constructive feedback that acknowledges their strengths, clearly addresses growth areas, and provides a path to promotion.

**Result:** A balanced review that motivates improvement without demoralizing, with specific examples and measurable goals for the next quarter.

**Example:** For the communication feedback, instead of "needs to communicate better," something like: "In the Q3 database migration project, the lack of proactive status updates led to misaligned expectations with the product team. Implementing weekly async updates via Slack would have prevented the 2-week timeline confusion. For Q1, I'd like to see you own the communication plan for Project X, including weekly stakeholder updates."
```

### Example 2: Website Audit

```
**Context:** Our SaaS company's marketing website has a 65% bounce rate (industry average is 45%) and our demo request conversion rate is 0.8% (we're targeting 2.5%). The site was last redesigned 3 years ago. We get 50,000 monthly visitors, primarily from organic search and paid ads.

**Action:** Conduct a strategic audit of our website and identify the highest-impact improvements.

**Result:** A prioritized list of 10 recommendations with expected impact on conversion rate, implementation difficulty, and quick wins we can do this week.

**Example:**
- Recommendation format: "Above-the-fold value proposition is unclear. Current: 'The platform for modern teams.' Suggested: 'Cut your sales cycle by 40% with AI-powered proposals.' Impact: High (addresses 80% of bounce on homepage). Effort: Low (copywriting + design, 1 day)."
```

### Example 3: Vendor Evaluation

```
**Context:** We're evaluating three CRM platforms for our 50-person sales team: Salesforce, HubSpot, and Pipedrive. Budget is $50K/year. Key requirements: Gmail integration, pipeline management, reporting, and mobile app. We currently use spreadsheets and it's not scaling.

**Action:** Create a comprehensive evaluation framework and score each vendor against our requirements.

**Result:** A decision matrix with clear scoring, total cost of ownership analysis, and a final recommendation with rationale.

**Example:**
Scoring format:
| Criteria | Weight | Salesforce | HubSpot | Pipedrive |
|----------|--------|------------|---------|-----------|
| Gmail Integration | 20% | 4/5 - Native, some sync issues | 5/5 - Seamless both directions | 4/5 - Works well, minor delay |

Include hidden costs like implementation, training, and add-ons in TCO analysis.
```

---

## 13. SCAMPER (Substitute-Combine-Adapt-Modify-Put to other uses-Eliminate-Reverse)

**Best for:** Innovation, brainstorming, and creative problem-solving

SCAMPER is a powerful ideation framework that systematically explores different angles for innovation.

### Template

```
Apply the SCAMPER method to [product/service/process]:

**Substitute:** What can be replaced with something else?
**Combine:** What can be merged or integrated?
**Adapt:** What can be adjusted for a different context?
**Modify:** What can be changed in form, quality, or attributes?
**Put to other uses:** What else could this be used for?
**Eliminate:** What can be removed or simplified?
**Reverse:** What can be rearranged or done in opposite order?
```

### Example 1: Mobile App Innovation

```
Apply SCAMPER to reimagine a traditional alarm clock app:

**Substitute:**
- Replace jarring alarm sounds with ___
- Substitute the snooze button with ___
- Replace time-based waking with ___

**Combine:**
- Merge with sleep tracking to ___
- Integrate with smart home devices to ___
- Combine with calendar to ___

**Adapt:**
- Adapt gamification elements from ___ to ___
- Borrow the gradual intensity concept from ___
- Apply social accountability from ___ apps

**Modify:**
- Change the wake-up experience to be ___
- Amplify the motivation aspect by ___
- Minimize the jarring experience by ___

**Put to other uses:**
- Use the same tech for ___
- Repurpose for productivity as ___
- Apply to health/wellness by ___

**Eliminate:**
- Remove the snooze option entirely because ___
- Eliminate the screen interaction by ___
- What if there was no sound at all?

**Reverse:**
- Instead of waking you up, what if it ___
- What if you set goals instead of times?
- What if the alarm got quieter as you ignore it?

Generate 3 complete product concepts from the most promising ideas.
```

### Example 2: Restaurant Service Model

```
Use SCAMPER to innovate a traditional sit-down restaurant experience:

**Substitute:**
- What if we replaced waiters with ___?
- What if menus were replaced by ___?
- What if payment was substituted with ___?

**Combine:**
- Combine dining with ___ experience
- Merge kitchen and dining areas to ___
- Integrate entertainment by ___

**Adapt:**
- Adapt the subscription model from ___ to dining
- Borrow the personalization from ___ apps
- Apply the transparency of ___ to ingredients/sourcing

**Modify:**
- Change the pacing of meal service to ___
- Amplify the social aspect by ___
- Reduce friction in ___ process

**Put to other uses:**
- Use restaurant space during off-hours for ___
- Kitchen equipment could also be used for ___
- Staff expertise could be applied to ___

**Eliminate:**
- What if we eliminated the physical menu?
- Remove tipping and replace with ___
- What if reservations didn't exist?

**Reverse:**
- What if customers cooked and chefs ate?
- What if pricing was determined after the meal?
- What if the restaurant came to you instead?

Identify the top 3 innovations that could genuinely disrupt casual dining.
```

### Example 3: Employee Onboarding Process

```
Apply SCAMPER to transform traditional corporate onboarding:

**Substitute:**
- Replace in-person HR orientation with ___
- Substitute paper forms with ___
- What if the manager wasn't the primary onboarding guide?

**Combine:**
- Merge onboarding with actual project work by ___
- Combine training with team building to ___
- Integrate performance goals from day 1 by ___

**Adapt:**
- Adapt the cohort model from ___ to corporate onboarding
- Borrow the progress tracking from ___ games
- Apply the mentorship structure from ___ programs

**Modify:**
- Change the timeline from 2 weeks to ___
- Intensify the connection-building aspect by ___
- Simplify compliance training by ___

**Put to other uses:**
- Use onboarding content for ___ as well
- Repurpose new hire projects as ___
- Apply the same structure to role transitions by ___

**Eliminate:**
- Remove information overload by ___
- Eliminate the "drinking from firehose" feeling by ___
- What if there was no formal onboarding at all?

**Reverse:**
- What if new hires designed their own onboarding?
- What if onboarding happened before the start date?
- What if experienced employees were re-onboarded annually?

Develop a detailed proposal for the most promising innovation.
```

---

## 14. TRACE (Task-Request-Action-Context-Example)

**Best for:** Academic contexts, course design, and audience-centered content

Originally developed for the academic community, TRACE ensures outputs are centered around the target audience.

### Template

```
**Task:** [The specific challenge or objective to address]
**Request:** [Direct request specifying the type of response desired]
**Action:** [Detailed actions the AI should undertake]
**Context:** [Background and audience information]
**Example:** [Optional sample of desired output style]
```

### Example 1: Course Module Design

```
**Task:** Design a learning module on "Introduction to Machine Learning" for non-technical business professionals.

**Request:** Create a comprehensive module outline with learning objectives, activities, and assessments that can be completed in a 4-hour workshop.

**Action:**
- Define 3-5 clear learning objectives using Bloom's taxonomy
- Structure content progression from concept to application
- Include interactive exercises that don't require coding
- Design an assessment that measures practical understanding
- Suggest real-world case studies from various industries

**Context:** Learners are mid-career managers (35-50 years old) in marketing, finance, and operations roles. They need to understand ML enough to make informed decisions about AI projects and communicate with data science teams. They have no programming background and may have math anxiety. Workshop will be delivered in-person with 20 participants.

**Example:** Learning objective format: "By the end of this module, participants will be able to evaluate whether a business problem is suitable for machine learning solution by applying the 'ML feasibility checklist' to a real scenario from their own work."
```

### Example 2: Research Synthesis

```
**Task:** Synthesize current research on the effectiveness of four-day work weeks on employee productivity and wellbeing.

**Request:** Generate a research brief suitable for HR executives considering implementing a pilot program.

**Action:**
- Review major studies and trials (Microsoft Japan, Iceland, UK pilot, etc.)
- Analyze findings across dimensions: productivity, wellbeing, retention, costs
- Identify implementation factors that affect outcomes
- Note limitations and gaps in current research
- Provide practical implications for decision-making

**Context:** The audience is senior HR leadership at a 500-person tech company. They need evidence-based insights to present to the CEO and board. They're skeptical of media hype and want to understand both benefits and risks. The company already has flexible work policies and high trust culture.

**Example:** Finding format: "The 2022 UK pilot (61 companies, 2,900 employees) found 71% of employees reported reduced burnout while 63% of companies saw improved talent attraction. However, customer-facing roles showed implementation challenges that required creative scheduling solutions. [Source: Autonomy Research, 2023]"
```

### Example 3: Patient Education Material

```
**Task:** Create patient education content about managing Type 2 Diabetes with lifestyle changes.

**Request:** Develop a comprehensive guide that patients can reference at home between doctor visits.

**Action:**
- Explain the science in accessible terms
- Provide specific, actionable dietary guidance
- Include exercise recommendations with modifications for various fitness levels
- Address common challenges and how to overcome them
- Create a self-monitoring framework

**Context:** Patients are newly diagnosed adults (50-70 years old), predominantly from lower socioeconomic backgrounds. Many have limited health literacy and may distrust medical advice. They face barriers including limited time for meal prep, food deserts, physical limitations, and family members with different dietary needs. Materials will be printed and reviewed once with a diabetes educator.

**Example:**
Instead of: "Reduce your glycemic load by selecting complex carbohydrates."
Use: "Choose foods that don't spike your blood sugar fast. Swap white bread for whole wheat. Pick brown rice over white rice. Add beans to stretch meals—they fill you up and are gentle on blood sugar."

Output should include visual elements described (diagrams, charts) that can be created separately.
```

---

## 15. ERA (Expectation-Role-Action)

**Best for:** Setting clear parameters and ensuring aligned outputs

ERA leads with the end goal, making it especially useful when you have specific output requirements.

### Template

```
**Expectation:** [Desired outcome, format, quality standards]
**Role:** [Who the AI should be / expertise needed]
**Action:** [Specific task to perform]
```

### Example 1: Executive Presentation

```
**Expectation:** I need a 10-slide presentation that can be delivered in 15 minutes to C-suite executives. Each slide should have one key message, minimal text (max 6 bullet points, 6 words each), and a suggestion for supporting visual. The presentation should lead to a decision: approve or reject a $2M investment.

**Role:** You are a McKinsey-trained management consultant who specializes in creating executive communications that drive decisions.

**Action:** Create a presentation recommending investment in a new customer data platform. Include: the business problem, market opportunity, solution overview, implementation plan, financial projections, risks and mitigations, and clear ask. Use the Pyramid Principle (MECE, top-down structure).
```

### Example 2: Technical Specification

```
**Expectation:** A technical specification document that an engineering team can use to implement a feature without ambiguity. Should be detailed enough that two different engineers would build essentially the same thing. Include acceptance criteria that QA can use for testing. Target length: 2-3 pages.

**Role:** You are a Staff Engineer at Stripe with experience writing technical specifications for payment systems that handle millions of transactions.

**Action:** Write a technical spec for implementing a "retry failed payment" feature. Users should be able to retry failed subscription payments from their dashboard. Consider: idempotency, race conditions, notification triggers, failure limit, and audit logging. Assume we use PostgreSQL, Redis, and a microservices architecture.
```

### Example 3: Legal Contract Summary

```
**Expectation:** A plain-English summary that a non-lawyer business owner can understand and use to make decisions. Highlight anything unusual or concerning. Maximum 1 page. Include a "sign/don't sign" recommendation with clear reasoning.

**Role:** You are a business attorney with 20 years of experience reviewing commercial contracts for SMBs. You're known for translating legalese into actionable advice.

**Action:** Review this software licensing agreement and summarize the key terms, obligations, risks, and negotiation opportunities. Pay special attention to: auto-renewal clauses, liability limitations, data ownership, termination rights, and price increase provisions.

[Contract text would follow]
```

---

## Framework Selection Guide

| Framework | Best For | Complexity | When to Use |
|-----------|----------|------------|-------------|
| **RTF** | General tasks | Low | Default choice for most prompts |
| **APE** | Quick tasks | Low | When you need fast, straightforward outputs |
| **ERA** | Clear deliverables | Low | When output format is critical |
| **TAG** | Goal-oriented tasks | Low | When outcomes matter most |
| **BAB** | Storytelling | Low | Marketing, persuasion, change management |
| **CARE** | Problem-solving | Medium | Evaluations, audits, strategy |
| **RACE** | Expert advice | Medium | When you need professional-level outputs |
| **RISEN** | Repeatable quality | Medium | Technical, business, creative—all-purpose |
| **CO-STAR** | Content creation | Medium | When voice and audience matter |
| **TRACE** | Educational content | Medium | Courses, training, documentation |
| **CRISPE** | Creative variations | Medium | Brainstorming, multiple options needed |
| **ROSES** | Complex problems | High | Detailed, structured analysis |
| **RASCEF** | Technical docs | High | SOPs, tutorials, specifications |
| **Chain of Thought** | Reasoning tasks | High | Math, logic, multi-step analysis |
| **SCAMPER** | Innovation | High | Ideation, product development |

---

## Tips for All Frameworks

1. **Be specific:** Vague inputs produce vague outputs. Include numbers, names, and concrete details.

2. **Provide context:** The more relevant background you give, the better the output.

3. **Include examples:** Even one example dramatically improves output quality.

4. **Iterate:** Use the first output to refine your prompt. Ask for revisions.

5. **Combine frameworks:** Use RISEN for structure, then CoT for complex reasoning within it.

6. **Match complexity to task:** Don't use RASCEF for a simple email. Don't use RTF for a technical specification.

---

## Resources

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [PromptHub](https://www.prompthub.us/)
- [AiPromptsX Frameworks](https://aipromptsx.com/prompts/frameworks)
- [GovTech Singapore CO-STAR Guide](https://www.tech.gov.sg/technews/mastering-the-art-of-prompt-engineering-with-empower/)

---

*These frameworks work across ChatGPT, Claude, Gemini, Llama, and other major AI models. Adjust tone, length constraints, and examples to suit each model's strengths.*
