/**
 * Simple YAML serializer for converting objects to YAML format
 */
export function toYaml(obj: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent);
  
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') {
    if (obj.includes('\n')) {
      return `|\n${obj.split('\n').map(line => spaces + '  ' + line).join('\n')}`;
    }
    return obj.includes(':') || obj.includes('#') ? `"${obj.replace(/"/g, '\\"')}"` : obj;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const inner = toYaml(item, indent + 1);
        const lines = inner.split('\n');
        return `${spaces}- ${lines[0]}\n${lines.slice(1).map(l => spaces + '  ' + l).join('\n')}`.trim();
      }
      return `${spaces}- ${toYaml(item, indent)}`;
    }).join('\n');
  }
  
  if (typeof obj === 'object') {
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    return entries.map(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
      }
      if (Array.isArray(value)) {
        return `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
      }
      return `${spaces}${key}: ${toYaml(value, indent)}`;
    }).join('\n');
  }
  
  return String(obj);
}
