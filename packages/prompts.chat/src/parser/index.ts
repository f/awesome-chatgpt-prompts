/**
 * Prompt Parser - Parse and load prompt files in various formats
 * 
 * Supports:
 * - .prompt.yml / .prompt.yaml (YAML format)
 * - .prompt.json (JSON format)
 * - .prompt.md (Markdown with frontmatter)
 * - .txt (Plain text)
 * 
 * @example
 * ```ts
 * import { parser } from 'prompts.chat';
 * 
 * const prompt = parser.parse(`
 * name: Code Review
 * messages:
 *   - role: system
 *     content: You are a code reviewer.
 * `);
 * ```
 */

export interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ParsedPrompt {
  name?: string;
  description?: string;
  model?: string;
  modelParameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  messages: PromptMessage[];
  variables?: Record<string, {
    description?: string;
    default?: string;
    required?: boolean;
  }>;
  metadata?: Record<string, unknown>;
}

/**
 * Parse YAML content
 * Note: This is a simple YAML parser for common prompt file structures
 * For full YAML support, the consuming project should use a proper YAML library
 */
function parseSimpleYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  
  let currentKey: string | null = null;
  const _currentValue: unknown = null; // Placeholder for future use
  let inArray = false;
  let inMultiline = false;
  let multilineContent = '';
  let arrayItems: unknown[] = [];
  let indent = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      if (inMultiline) {
        multilineContent += '\n';
      }
      continue;
    }
    
    // Handle multiline content (|)
    if (inMultiline) {
      const lineIndent = line.search(/\S/);
      if (lineIndent > indent) {
        multilineContent += (multilineContent ? '\n' : '') + line.slice(indent + 2);
        continue;
      } else {
        // End of multiline
        if (inArray && currentKey) {
          const lastItem = arrayItems[arrayItems.length - 1] as Record<string, unknown>;
          if (lastItem && typeof lastItem === 'object') {
            const keys = Object.keys(lastItem);
            const lastKey = keys[keys.length - 1];
            lastItem[lastKey] = multilineContent.trim();
          }
        } else if (currentKey) {
          result[currentKey] = multilineContent.trim();
        }
        inMultiline = false;
        multilineContent = '';
      }
    }
    
    // Handle array items
    if (trimmed.startsWith('- ')) {
      if (!inArray && currentKey) {
        inArray = true;
        arrayItems = [];
      }
      
      const itemContent = trimmed.slice(2);
      
      // Check if it's a key-value pair
      const kvMatch = itemContent.match(/^(\w+):\s*(.*)$/);
      if (kvMatch) {
        const obj: Record<string, unknown> = {};
        obj[kvMatch[1]] = kvMatch[2] === '|' ? '' : (kvMatch[2] || '');
        
        if (kvMatch[2] === '|') {
          inMultiline = true;
          indent = line.search(/\S/);
          multilineContent = '';
        }
        
        arrayItems.push(obj);
      } else {
        arrayItems.push(itemContent);
      }
      continue;
    }
    
    // Handle nested object properties in arrays
    if (inArray && line.startsWith('    ')) {
      const propMatch = trimmed.match(/^(\w+):\s*(.*)$/);
      if (propMatch && arrayItems.length > 0) {
        const lastItem = arrayItems[arrayItems.length - 1];
        if (typeof lastItem === 'object' && lastItem !== null) {
          (lastItem as Record<string, unknown>)[propMatch[1]] = 
            propMatch[2] === '|' ? '' : (propMatch[2] || '');
          
          if (propMatch[2] === '|') {
            inMultiline = true;
            indent = line.search(/\S/);
            multilineContent = '';
          }
        }
      }
      continue;
    }
    
    // End array if we're back to root level
    if (inArray && !line.startsWith(' ') && !line.startsWith('\t')) {
      if (currentKey) {
        result[currentKey] = arrayItems;
      }
      inArray = false;
      arrayItems = [];
    }
    
    // Handle key-value pairs
    const match = trimmed.match(/^(\w+):\s*(.*)$/);
    if (match) {
      currentKey = match[1];
      const value = match[2];
      
      if (value === '' || value === '|' || value === '>') {
        // Multiline or nested content
        if (value === '|' || value === '>') {
          inMultiline = true;
          indent = line.search(/\S/);
          multilineContent = '';
        }
      } else if (value.startsWith('"') && value.endsWith('"')) {
        result[currentKey] = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        result[currentKey] = value.slice(1, -1);
      } else if (value === 'true') {
        result[currentKey] = true;
      } else if (value === 'false') {
        result[currentKey] = false;
      } else if (!isNaN(Number(value))) {
        result[currentKey] = Number(value);
      } else {
        result[currentKey] = value;
      }
    }
  }
  
  // Handle remaining array
  if (inArray && currentKey) {
    result[currentKey] = arrayItems;
  }
  
  // Handle remaining multiline
  if (inMultiline && currentKey) {
    result[currentKey] = multilineContent.trim();
  }
  
  return result;
}

/**
 * Parse JSON content
 */
function parseJson(content: string): Record<string, unknown> {
  return JSON.parse(content);
}

/**
 * Parse Markdown with frontmatter
 */
function parseMarkdown(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (frontmatterMatch) {
    const frontmatter = parseSimpleYaml(frontmatterMatch[1]);
    const body = frontmatterMatch[2].trim();
    
    return {
      ...frontmatter,
      messages: [{ role: 'system', content: body }],
    };
  }
  
  // No frontmatter, treat entire content as system message
  return {
    messages: [{ role: 'system', content: content.trim() }],
  };
}

/**
 * Normalize parsed data to ParsedPrompt format
 */
function normalize(data: Record<string, unknown>): ParsedPrompt {
  const messages: PromptMessage[] = [];
  
  // Handle messages array
  if (Array.isArray(data.messages)) {
    for (const msg of data.messages) {
      if (typeof msg === 'object' && msg !== null) {
        const m = msg as Record<string, unknown>;
        messages.push({
          role: (m.role as PromptMessage['role']) || 'user',
          content: String(m.content || ''),
        });
      }
    }
  }
  
  // Handle single content field
  if (messages.length === 0 && typeof data.content === 'string') {
    messages.push({ role: 'system', content: data.content });
  }
  
  // Handle prompt field (alias for content)
  if (messages.length === 0 && typeof data.prompt === 'string') {
    messages.push({ role: 'system', content: data.prompt });
  }
  
  return {
    name: data.name as string | undefined,
    description: data.description as string | undefined,
    model: data.model as string | undefined,
    modelParameters: data.modelParameters as ParsedPrompt['modelParameters'],
    messages,
    variables: data.variables as ParsedPrompt['variables'],
    metadata: data.metadata as Record<string, unknown>,
  };
}

/**
 * Parse prompt content in various formats
 */
export function parse(content: string, format?: 'yaml' | 'json' | 'markdown' | 'text'): ParsedPrompt {
  const trimmed = content.trim();
  
  // Auto-detect format if not specified
  if (!format) {
    if (trimmed.startsWith('{')) {
      format = 'json';
    } else if (trimmed.startsWith('---')) {
      format = 'markdown';
    } else if (trimmed.includes(':') && (trimmed.includes('\n  ') || trimmed.includes('\n-'))) {
      format = 'yaml';
    } else {
      format = 'text';
    }
  }
  
  let data: Record<string, unknown>;
  
  switch (format) {
    case 'json':
      data = parseJson(trimmed);
      break;
    case 'yaml':
      data = parseSimpleYaml(trimmed);
      break;
    case 'markdown':
      data = parseMarkdown(trimmed);
      break;
    case 'text':
    default:
      data = { messages: [{ role: 'system', content: trimmed }] };
      break;
  }
  
  return normalize(data);
}

/**
 * Serialize a ParsedPrompt to YAML format
 */
export function toYaml(prompt: ParsedPrompt): string {
  const lines: string[] = [];
  
  if (prompt.name) {
    lines.push(`name: ${prompt.name}`);
  }
  
  if (prompt.description) {
    lines.push(`description: ${prompt.description}`);
  }
  
  if (prompt.model) {
    lines.push(`model: ${prompt.model}`);
  }
  
  if (prompt.modelParameters) {
    lines.push('modelParameters:');
    for (const [key, value] of Object.entries(prompt.modelParameters)) {
      if (value !== undefined) {
        lines.push(`  ${key}: ${value}`);
      }
    }
  }
  
  if (prompt.messages.length > 0) {
    lines.push('messages:');
    for (const msg of prompt.messages) {
      lines.push(`  - role: ${msg.role}`);
      if (msg.content.includes('\n')) {
        lines.push('    content: |');
        for (const line of msg.content.split('\n')) {
          lines.push(`      ${line}`);
        }
      } else {
        lines.push(`    content: "${msg.content.replace(/"/g, '\\"')}"`);
      }
    }
  }
  
  return lines.join('\n');
}

/**
 * Serialize a ParsedPrompt to JSON format
 */
export function toJson(prompt: ParsedPrompt, pretty: boolean = true): string {
  return JSON.stringify(prompt, null, pretty ? 2 : 0);
}

/**
 * Get the system message content from a parsed prompt
 */
export function getSystemPrompt(prompt: ParsedPrompt): string {
  const systemMessage = prompt.messages.find(m => m.role === 'system');
  return systemMessage?.content || '';
}

/**
 * Interpolate variables in a prompt
 */
export function interpolate(
  prompt: ParsedPrompt,
  values: Record<string, string>
): ParsedPrompt {
  const interpolateString = (str: string): string => {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in values) return values[key];
      if (prompt.variables?.[key]?.default) return prompt.variables[key].default!;
      return match;
    });
  };
  
  return {
    ...prompt,
    messages: prompt.messages.map(msg => ({
      ...msg,
      content: interpolateString(msg.content),
    })),
  };
}
