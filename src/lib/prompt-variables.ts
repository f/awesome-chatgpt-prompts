export interface Variable {
  name: string;
  defaultValue: string;
  fullMatch: string;
}

/**
 * Parse ${variablename:defaultvalue} or ${variablename} patterns from prompt content
 */
export function parseVariables(content: string): Variable[] {
  const regex = /\$\{([^:}]+)(?::([^}]*))?\}/g;
  const variables: Variable[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    variables.push({
      name: match[1].trim(),
      defaultValue: (match[2] ?? "").trim(),
      fullMatch: match[0],
    });
  }

  return variables;
}

/**
 * Get unique variable names with their default values (first occurrence wins)
 */
export function getUniqueVariables(variables: Variable[]): { name: string; defaultValue: string }[] {
  const seen = new Map<string, string>();
  for (const variable of variables) {
    if (!seen.has(variable.name)) {
      seen.set(variable.name, variable.defaultValue);
    }
  }
  return Array.from(seen.entries()).map(([name, defaultValue]) => ({ name, defaultValue }));
}

/**
 * Substitute variables in content with provided values, falling back to defaults
 */
export function substituteVariables(content: string, values: Record<string, string>): string {
  const variables = parseVariables(content);
  let result = content;
  for (const variable of variables) {
    const value = values[variable.name] || variable.defaultValue;
    result = result.replace(variable.fullMatch, value);
  }
  return result;
}
