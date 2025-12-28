import { chat } from 'prompts.chat';

// Create a chat prompt for conversational AI
const prompt = chat()
  // Define the AI's role and expertise
  .role("senior software architect")
  .tone("professional")
  .expertise(["coding", "engineering"])
  
  // Set the main task
  .task("Review code and provide architectural feedback")
  
  // Configure reasoning style
  .stepByStep()
  
  // Output format
  .json()
  
  // Response length
  .detailed()
  
  .build();

export default {
  json: prompt.messages,
  yaml: prompt.messages,
  markdown: prompt.systemPrompt,
};
