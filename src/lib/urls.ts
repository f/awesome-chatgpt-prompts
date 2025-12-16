/**
 * Generates a URL path for a prompt, including the slug if available
 * Format: /prompts/{id} or /prompts/{id}_{slug}
 */
export function getPromptUrl(id: string, slug?: string | null): string {
  if (slug) {
    return `/prompts/${id}_${slug}`;
  }
  return `/prompts/${id}`;
}

/**
 * Generates edit URL for a prompt
 */
export function getPromptEditUrl(id: string, slug?: string | null): string {
  return `${getPromptUrl(id, slug)}/edit`;
}

/**
 * Generates changes URL for a prompt
 */
export function getPromptChangesUrl(id: string, slug?: string | null): string {
  return `${getPromptUrl(id, slug)}/changes/new`;
}
