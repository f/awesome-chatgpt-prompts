import OpenAI from 'openai';
import { chat } from 'prompts.chat';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a chat prompt using the fluent builder API
const systemPrompt = chat()
  // Define the AI's persona
  .role("Senior Code Reviewer")
  .expertise(["coding", "engineering"])
  .tone("professional")
  .personality(["helpful", "thorough", "constructive"])
  
  // Set the context
  .context("You are reviewing TypeScript code for a startup")
  .domain("Software Development")
  .audience("Junior to mid-level developers")
  
  // Define constraints
  .constraints([
    "Always explain your reasoning",
    "Provide code examples when helpful",
    "Be concise but thorough",
  ])
  
  // Configure output format
  .json()
  .detailed()
  .withExamples()
  
  // Add few-shot examples
  .example(
    "Review: const x = 1",
    '{"issues": [], "suggestions": ["Use descriptive variable names"], "rating": 8}'
  )
  
  .build();

// Use the prompt with OpenAI
async function reviewCode(code: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt.systemPrompt },
      { role: "user", content: `Review this code:\n\n${code}` },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

// Example usage
const review = await reviewCode(`
function add(a, b) {
  return a + b;
}
`);

console.log(review);
