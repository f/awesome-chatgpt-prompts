/**
 * API Documentation Generator
 * Parses TypeScript source files using the TypeScript Compiler API
 * and generates markdown documentation from types, interfaces, functions, and classes.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DocEntry {
  name: string;
  kind: 'interface' | 'type' | 'function' | 'class' | 'method' | 'property' | 'variable';
  description?: string;
  signature?: string;
  parameters?: Array<{ name: string; type: string; description?: string; optional?: boolean; defaultValue?: string }>;
  returnType?: string;
  returnDescription?: string;
  properties?: DocEntry[];
  methods?: DocEntry[];
  examples?: string[];
  tags?: Record<string, string>;
  exported?: boolean;
}

interface ModuleDoc {
  name: string;
  description?: string;
  exports: DocEntry[];
}

function getJSDocComment(node: ts.Node, sourceFile: ts.SourceFile): { description?: string; tags: Record<string, string>; examples: string[] } {
  const tags: Record<string, string> = {};
  const examples: string[] = [];
  let description: string | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TypeScript AST doesn't expose jsDoc in types
  const jsDocNodes = (node as any).jsDoc as ts.JSDoc[] | undefined;
  if (jsDocNodes && jsDocNodes.length > 0) {
    const jsDoc = jsDocNodes[0];
    
    if (jsDoc.comment) {
      description = typeof jsDoc.comment === 'string' 
        ? jsDoc.comment 
        : jsDoc.comment.map(c => c.text || '').join('');
    }

    if (jsDoc.tags) {
      for (const tag of jsDoc.tags) {
        const tagName = tag.tagName.text;
        let tagComment = '';
        
        if (tag.comment) {
          tagComment = typeof tag.comment === 'string'
            ? tag.comment
            : tag.comment.map(c => c.text || '').join('');
        }

        if (tagName === 'example') {
          examples.push(tagComment);
        } else if (tagName === 'param' && ts.isJSDocParameterTag(tag)) {
          const paramName = tag.name.getText(sourceFile);
          tags[`param:${paramName}`] = tagComment;
        } else if (tagName === 'returns' || tagName === 'return') {
          tags['returns'] = tagComment;
        } else {
          tags[tagName] = tagComment;
        }
      }
    }
  }

  return { description, tags, examples };
}

function getTypeString(type: ts.TypeNode | undefined, sourceFile: ts.SourceFile): string {
  if (!type) return 'any';
  return type.getText(sourceFile);
}

function parseFunction(node: ts.FunctionDeclaration | ts.MethodDeclaration | ts.ArrowFunction, sourceFile: ts.SourceFile, checker: ts.TypeChecker): DocEntry {
  const { description, tags, examples } = getJSDocComment(node, sourceFile);
  
  const name = ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)
    ? node.name?.getText(sourceFile) || 'anonymous'
    : 'anonymous';

  const parameters: Array<{ name: string; type: string; description?: string; optional?: boolean; defaultValue?: string; isRest?: boolean }> = [];
  
  for (const param of node.parameters) {
    const paramName = param.name.getText(sourceFile);
    const paramType = getTypeString(param.type, sourceFile);
    const optional = !!param.questionToken || !!param.initializer;
    const defaultValue = param.initializer?.getText(sourceFile);
    const paramDescription = tags[`param:${paramName}`];
    const isRest = !!param.dotDotDotToken;

    parameters.push({
      name: paramName,
      type: paramType,
      description: paramDescription,
      optional,
      defaultValue,
      isRest,
    });
  }

  const returnType = getTypeString(node.type, sourceFile);

  // Build signature - handle rest parameters with ... prefix
  const paramSignature = parameters
    .map(p => `${p.isRest ? '...' : ''}${p.name}${p.optional ? '?' : ''}: ${p.type}`)
    .join(', ');
  const signature = `${name}(${paramSignature}): ${returnType}`;

  return {
    name,
    kind: ts.isMethodDeclaration(node) ? 'method' : 'function',
    description,
    signature,
    parameters,
    returnType,
    returnDescription: tags['returns'],
    examples,
    tags,
  };
}

function parseInterface(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile, checker: ts.TypeChecker): DocEntry {
  const { description, tags, examples } = getJSDocComment(node, sourceFile);
  const name = node.name.getText(sourceFile);

  const properties: DocEntry[] = [];
  
  for (const member of node.members) {
    if (ts.isPropertySignature(member)) {
      const propName = member.name.getText(sourceFile);
      const propType = getTypeString(member.type, sourceFile);
      const optional = !!member.questionToken;
      const { description: propDesc } = getJSDocComment(member, sourceFile);

      properties.push({
        name: propName,
        kind: 'property',
        description: propDesc,
        signature: `${propName}${optional ? '?' : ''}: ${propType}`,
      });
    } else if (ts.isMethodSignature(member)) {
      const methodName = member.name.getText(sourceFile);
      const params = member.parameters.map(p => {
        const pName = p.name.getText(sourceFile);
        const pType = getTypeString(p.type, sourceFile);
        const pOptional = !!p.questionToken;
        return `${pName}${pOptional ? '?' : ''}: ${pType}`;
      }).join(', ');
      const returnType = getTypeString(member.type, sourceFile);
      const { description: methodDesc } = getJSDocComment(member, sourceFile);

      properties.push({
        name: methodName,
        kind: 'method',
        description: methodDesc,
        signature: `${methodName}(${params}): ${returnType}`,
      });
    }
  }

  return {
    name,
    kind: 'interface',
    description,
    properties,
    examples,
    tags,
  };
}

function parseTypeAlias(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile, checker: ts.TypeChecker): DocEntry {
  const { description, tags, examples } = getJSDocComment(node, sourceFile);
  const name = node.name.getText(sourceFile);
  const typeText = node.type.getText(sourceFile);

  return {
    name,
    kind: 'type',
    description,
    signature: `type ${name} = ${typeText}`,
    examples,
    tags,
  };
}

function parseClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile, checker: ts.TypeChecker): DocEntry {
  const { description, tags, examples } = getJSDocComment(node, sourceFile);
  const name = node.name?.getText(sourceFile) || 'AnonymousClass';

  const methods: DocEntry[] = [];
  const properties: DocEntry[] = [];

  for (const member of node.members) {
    // Skip private members
    const modifiers = ts.canHaveModifiers(member) ? ts.getModifiers(member) : undefined;
    const isPrivate = modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword);
    if (isPrivate) continue;

    if (ts.isMethodDeclaration(member)) {
      const methodDoc = parseFunction(member, sourceFile, checker);
      // Only include public methods (not starting with _)
      if (!methodDoc.name.startsWith('_')) {
        methods.push(methodDoc);
      }
    } else if (ts.isPropertyDeclaration(member)) {
      const propName = member.name.getText(sourceFile);
      if (!propName.startsWith('_')) {
        const propType = getTypeString(member.type, sourceFile);
        const { description: propDesc } = getJSDocComment(member, sourceFile);
        properties.push({
          name: propName,
          kind: 'property',
          description: propDesc,
          signature: `${propName}: ${propType}`,
        });
      }
    }
  }

  return {
    name,
    kind: 'class',
    description,
    methods,
    properties,
    examples,
    tags,
  };
}

function parseVariableStatement(node: ts.VariableStatement, sourceFile: ts.SourceFile, checker: ts.TypeChecker): DocEntry[] {
  const { description, tags, examples } = getJSDocComment(node, sourceFile);
  const entries: DocEntry[] = [];

  for (const decl of node.declarationList.declarations) {
    const name = decl.name.getText(sourceFile);
    let signature = name;
    
    if (decl.type) {
      signature += `: ${decl.type.getText(sourceFile)}`;
    } else if (decl.initializer) {
      // Try to infer from initializer
      const initText = decl.initializer.getText(sourceFile);
      if (initText.length < 100) {
        signature += ` = ${initText}`;
      }
    }

    // Parse object literal properties (methods) for objects like `templates`
    const methods: DocEntry[] = [];
    if (decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
      for (const prop of decl.initializer.properties) {
        if (ts.isPropertyAssignment(prop) && prop.name) {
          const propName = prop.name.getText(sourceFile);
          const { description: propDesc, tags: propTags, examples: propExamples } = getJSDocComment(prop, sourceFile);
          
          // Handle arrow functions and function expressions
          if (ts.isArrowFunction(prop.initializer) || ts.isFunctionExpression(prop.initializer)) {
            const fn = prop.initializer;
            const params: Array<{ name: string; type: string; description?: string; optional?: boolean; defaultValue?: string }> = [];
            
            for (const param of fn.parameters) {
              const paramName = param.name.getText(sourceFile);
              const paramType = getTypeString(param.type, sourceFile);
              const optional = !!param.questionToken || !!param.initializer;
              const defaultValue = param.initializer?.getText(sourceFile);
              
              params.push({
                name: paramName,
                type: paramType,
                description: propTags[`param:${paramName}`],
                optional,
                defaultValue,
              });
            }
            
            const returnType = getTypeString(fn.type, sourceFile);
            const paramSignature = params
              .map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
              .join(', ');
            const methodSignature = `${propName}(${paramSignature}): ${returnType}`;
            
            methods.push({
              name: propName,
              kind: 'method',
              description: propDesc,
              signature: methodSignature,
              parameters: params,
              returnType,
              examples: propExamples,
              tags: propTags,
            });
          }
        } else if (ts.isMethodDeclaration(prop) && prop.name) {
          const methodDoc = parseFunction(prop, sourceFile, checker);
          methods.push(methodDoc);
        }
      }
    }

    entries.push({
      name,
      kind: 'variable',
      description,
      signature,
      examples,
      tags,
      methods: methods.length > 0 ? methods : undefined,
    });
  }

  return entries;
}

function parseSourceFile(filePath: string, program: ts.Program): ModuleDoc {
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`Could not find source file: ${filePath}`);
  }

  const checker = program.getTypeChecker();
  const exports: DocEntry[] = [];
  
  // Get module-level JSDoc if any
  let moduleDescription: string | undefined;
  const firstStatement = sourceFile.statements[0];
  if (firstStatement) {
    const { description } = getJSDocComment(firstStatement, sourceFile);
    if (description && description.includes('@module')) {
      moduleDescription = description;
    }
  }

  // Check for leading comment as module description
  const fullText = sourceFile.getFullText();
  const leadingCommentMatch = fullText.match(/^\/\*\*\s*\n([^*]|\*(?!\/))*\*\//);
  if (leadingCommentMatch) {
    const comment = leadingCommentMatch[0];
    const lines = comment.split('\n').slice(1, -1).map(l => l.replace(/^\s*\*\s?/, ''));
    moduleDescription = lines.join('\n').trim();
  }

  function visit(node: ts.Node) {
    // Check if node is exported
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    const isExported = modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);

    if (ts.isFunctionDeclaration(node) && isExported && node.name) {
      const doc = parseFunction(node, sourceFile!, checker);
      doc.exported = true;
      exports.push(doc);
    } else if (ts.isInterfaceDeclaration(node) && isExported) {
      const doc = parseInterface(node, sourceFile!, checker);
      doc.exported = true;
      exports.push(doc);
    } else if (ts.isTypeAliasDeclaration(node) && isExported) {
      const doc = parseTypeAlias(node, sourceFile!, checker);
      doc.exported = true;
      exports.push(doc);
    } else if (ts.isClassDeclaration(node) && isExported && node.name) {
      const doc = parseClass(node, sourceFile!, checker);
      doc.exported = true;
      exports.push(doc);
    } else if (ts.isVariableStatement(node) && isExported) {
      const docs = parseVariableStatement(node, sourceFile!, checker);
      docs.forEach(d => {
        d.exported = true;
        exports.push(d);
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const moduleName = path.basename(filePath, '.ts');
  return {
    name: moduleName,
    description: moduleDescription,
    exports,
  };
}

function generateMarkdown(modules: ModuleDoc[]): string {
  const lines: string[] = [];
  
  lines.push('# API Reference\n');
  lines.push('> Auto-generated from TypeScript source files\n');

  // Table of contents
  lines.push('## Table of Contents\n');
  for (const mod of modules) {
    lines.push(`- [${mod.name}](#${mod.name.toLowerCase()})`);
    for (const exp of mod.exports) {
      if (exp.kind === 'function' || exp.kind === 'class') {
        lines.push(`  - [${exp.name}](#${exp.name.toLowerCase()})`);
      }
    }
  }
  lines.push('');

  // Module documentation
  for (const mod of modules) {
    lines.push(`---\n`);
    lines.push(`## ${mod.name}\n`);
    
    if (mod.description) {
      lines.push(`${mod.description}\n`);
    }

    // Group by kind
    const interfaces = mod.exports.filter(e => e.kind === 'interface');
    const types = mod.exports.filter(e => e.kind === 'type');
    const functions = mod.exports.filter(e => e.kind === 'function');
    const classes = mod.exports.filter(e => e.kind === 'class');
    const variables = mod.exports.filter(e => e.kind === 'variable');

    // Types
    if (types.length > 0) {
      lines.push(`### Types\n`);
      for (const t of types) {
        lines.push(`#### \`${t.name}\`\n`);
        if (t.description) {
          lines.push(`${t.description}\n`);
        }
        lines.push('```typescript');
        lines.push(t.signature || '');
        lines.push('```\n');
      }
    }

    // Interfaces
    if (interfaces.length > 0) {
      lines.push(`### Interfaces\n`);
      for (const iface of interfaces) {
        lines.push(`#### \`${iface.name}\`\n`);
        if (iface.description) {
          lines.push(`${iface.description}\n`);
        }
        if (iface.properties && iface.properties.length > 0) {
          lines.push('| Property | Type | Description |');
          lines.push('|----------|------|-------------|');
          for (const prop of iface.properties) {
            const sig = prop.signature || prop.name;
            const typeMatch = sig.match(/:\s*(.+)$/);
            const type = typeMatch ? typeMatch[1] : 'unknown';
            lines.push(`| \`${prop.name}\` | \`${type}\` | ${prop.description || '-'} |`);
          }
          lines.push('');
        }
      }
    }

    // Classes
    if (classes.length > 0) {
      lines.push(`### Classes\n`);
      for (const cls of classes) {
        lines.push(`#### \`${cls.name}\`\n`);
        if (cls.description) {
          lines.push(`${cls.description}\n`);
        }

        if (cls.methods && cls.methods.length > 0) {
          lines.push('**Methods:**\n');
          lines.push('| Method | Description |');
          lines.push('|--------|-------------|');
          for (const method of cls.methods) {
            const sig = method.signature?.replace(/\n/g, ' ') || method.name;
            lines.push(`| \`${sig}\` | ${method.description || '-'} |`);
          }
          lines.push('');

          // Detailed method docs
          for (const method of cls.methods) {
            lines.push(`##### \`${method.name}()\`\n`);
            if (method.description) {
              lines.push(`${method.description}\n`);
            }
            if (method.signature) {
              lines.push('```typescript');
              lines.push(method.signature);
              lines.push('```\n');
            }
            if (method.parameters && method.parameters.length > 0) {
              lines.push('**Parameters:**\n');
              for (const param of method.parameters) {
                const opt = param.optional ? ' (optional)' : '';
                const def = param.defaultValue ? ` = \`${param.defaultValue}\`` : '';
                lines.push(`- \`${param.name}\`: \`${param.type}\`${opt}${def}${param.description ? ` - ${param.description}` : ''}`);
              }
              lines.push('');
            }
            if (method.returnType && method.returnType !== 'void') {
              lines.push(`**Returns:** \`${method.returnType}\`${method.returnDescription ? ` - ${method.returnDescription}` : ''}\n`);
            }
          }
        }
      }
    }

    // Functions
    if (functions.length > 0) {
      lines.push(`### Functions\n`);
      for (const fn of functions) {
        lines.push(`#### \`${fn.name}()\`\n`);
        if (fn.description) {
          lines.push(`${fn.description}\n`);
        }
        if (fn.signature) {
          lines.push('```typescript');
          lines.push(fn.signature);
          lines.push('```\n');
        }
        if (fn.parameters && fn.parameters.length > 0) {
          lines.push('**Parameters:**\n');
          for (const param of fn.parameters) {
            const opt = param.optional ? ' (optional)' : '';
            const def = param.defaultValue ? ` = \`${param.defaultValue}\`` : '';
            lines.push(`- \`${param.name}\`: \`${param.type}\`${opt}${def}${param.description ? ` - ${param.description}` : ''}`);
          }
          lines.push('');
        }
        if (fn.returnType && fn.returnType !== 'void') {
          lines.push(`**Returns:** \`${fn.returnType}\`${fn.returnDescription ? ` - ${fn.returnDescription}` : ''}\n`);
        }
        if (fn.examples && fn.examples.length > 0) {
          lines.push('**Example:**\n');
          for (const example of fn.examples) {
            lines.push('```typescript');
            lines.push(example.trim());
            lines.push('```\n');
          }
        }
      }
    }

    // Variables/Constants
    if (variables.length > 0) {
      lines.push(`### Constants\n`);
      for (const v of variables) {
        lines.push(`#### \`${v.name}\`\n`);
        if (v.description) {
          lines.push(`${v.description}\n`);
        }
        if (v.signature) {
          lines.push('```typescript');
          lines.push(v.signature);
          lines.push('```\n');
        }
      }
    }
  }

  return lines.join('\n');
}

// Generate TypeScript file for IDE sidebar
function generateSidebarTS(modules: ModuleDoc[]): string {
  const lines: string[] = [];
  
  lines.push('/**');
  lines.push(' * Auto-generated API documentation for IDE sidebar');
  lines.push(' * Generated from TypeScript source files via reflection');
  lines.push(' * DO NOT EDIT MANUALLY - run `npm run docs:generate` to regenerate');
  lines.push(' */');
  lines.push('');
  lines.push('export interface ApiSection {');
  lines.push('  name: string;');
  lines.push('  items: ApiItem[];');
  lines.push('}');
  lines.push('');
  lines.push('export interface ApiItem {');
  lines.push('  name: string;');
  lines.push('  type: "function" | "class" | "type" | "interface" | "const" | "method";');
  lines.push('  signature?: string;');
  lines.push('  description?: string;');
  lines.push('  example?: string;');
  lines.push('  returns?: string;');
  lines.push('  params?: { name: string; type: string; description?: string }[];');
  lines.push('}');
  lines.push('');
  lines.push('export const API_DOCS: ApiSection[] = [');

  // Group modules by category for better organization
  const moduleGroups: Record<string, ModuleDoc[]> = {
    'Text Prompts': [],
    'Chat Prompts': [],
    'Image Prompts': [],
    'Video Prompts': [],
    'Audio Prompts': [],
    'Variables': [],
    'Similarity': [],
    'Quality': [],
    'Parser': [],
  };

  for (const mod of modules) {
    if (mod.name.includes('variables')) {
      moduleGroups['Variables'].push(mod);
    } else if (mod.name.includes('similarity')) {
      moduleGroups['Similarity'].push(mod);
    } else if (mod.name.includes('quality')) {
      moduleGroups['Quality'].push(mod);
    } else if (mod.name.includes('parser')) {
      moduleGroups['Parser'].push(mod);
    } else if (mod.name.includes('chat')) {
      moduleGroups['Chat Prompts'].push(mod);
    } else if (mod.name.includes('media') || mod.name.includes('image')) {
      moduleGroups['Image Prompts'].push(mod);
    } else if (mod.name.includes('video')) {
      moduleGroups['Video Prompts'].push(mod);
    } else if (mod.name.includes('audio')) {
      moduleGroups['Audio Prompts'].push(mod);
    } else if (mod.name.includes('builder')) {
      moduleGroups['Text Prompts'].push(mod);
    }
  }

  // Process each group
  for (const [groupName, groupModules] of Object.entries(moduleGroups)) {
    if (groupModules.length === 0) continue;

    const items: string[] = [];
    
    for (const mod of groupModules) {
      // Add functions
      const functions = mod.exports.filter(e => e.kind === 'function');
      for (const fn of functions) {
        const params = fn.parameters?.map(p => ({
          name: p.name,
          type: p.type,
          description: p.description || undefined,
        })) || [];
        
        items.push(`    {
      name: "${fn.name}()",
      type: "function",
      signature: ${JSON.stringify(fn.signature || fn.name)},
      description: ${JSON.stringify(fn.description || '')},
      returns: ${JSON.stringify(fn.returnType || '')},
      params: ${JSON.stringify(params)},
    }`);
      }

      // Add classes with their methods
      const classes = mod.exports.filter(e => e.kind === 'class');
      for (const cls of classes) {
        // Add the class itself
        items.push(`    {
      name: "${cls.name}",
      type: "class",
      description: ${JSON.stringify(cls.description || '')},
    }`);
        
        // Add class methods
        if (cls.methods) {
          for (const method of cls.methods) {
            const params = method.parameters?.map(p => ({
              name: p.name,
              type: p.type,
              description: p.description || undefined,
            })) || [];
            
            items.push(`    {
      name: ".${method.name}()",
      type: "method",
      signature: ${JSON.stringify(method.signature || method.name)},
      description: ${JSON.stringify(method.description || '')},
      returns: ${JSON.stringify(method.returnType || '')},
      params: ${JSON.stringify(params)},
    }`);
          }
        }
      }

      // Add interfaces
      const interfaces = mod.exports.filter(e => e.kind === 'interface');
      for (const iface of interfaces) {
        items.push(`    {
      name: "${iface.name}",
      type: "interface",
      description: ${JSON.stringify(iface.description || '')},
    }`);
      }

      // Add types
      const types = mod.exports.filter(e => e.kind === 'type');
      for (const t of types) {
        items.push(`    {
      name: "${t.name}",
      type: "type",
      signature: ${JSON.stringify(t.signature || '')},
      description: ${JSON.stringify(t.description || '')},
    }`);
      }

      // Add constants/variables
      const vars = mod.exports.filter(e => e.kind === 'variable');
      for (const v of vars) {
        items.push(`    {
      name: "${v.name}",
      type: "const",
      signature: ${JSON.stringify(v.signature || '')},
      description: ${JSON.stringify(v.description || '')},
    }`);
        
        // Add methods from object literals (like templates)
        if (v.methods) {
          for (const method of v.methods) {
            const params = method.parameters?.map(p => ({
              name: p.name,
              type: p.type,
              description: p.description || undefined,
            })) || [];
            
            items.push(`    {
      name: "${v.name}.${method.name}()",
      type: "method",
      signature: ${JSON.stringify(method.signature || method.name)},
      description: ${JSON.stringify(method.description || '')},
      returns: ${JSON.stringify(method.returnType || '')},
      params: ${JSON.stringify(params)},
    }`);
          }
        }
      }
    }

    if (items.length > 0) {
      lines.push(`  {`);
      lines.push(`    name: "${groupName}",`);
      lines.push(`    items: [`);
      lines.push(items.join(',\n'));
      lines.push(`    ],`);
      lines.push(`  },`);
    }
  }

  lines.push('];');
  lines.push('');
  
  return lines.join('\n');
}

// Generate TypeScript declaration file content for Monaco editor
function generateTypeDefinitions(modules: ModuleDoc[]): string {
  const lines: string[] = [];
  
  lines.push('/**');
  lines.push(' * Auto-generated type definitions for prompts.chat');
  lines.push(' * Generated from TypeScript source files via reflection');
  lines.push(' * DO NOT EDIT MANUALLY - run `npm run docs:generate` to regenerate');
  lines.push(' */');
  lines.push('');
  lines.push("export const TYPE_DEFINITIONS = `");
  lines.push("declare module 'prompts.chat' {");

  // Group by category
  const builderModule = modules.find(m => m.name === 'builder/index');
  const chatModule = modules.find(m => m.name === 'builder/chat');
  const mediaModule = modules.find(m => m.name === 'builder/media');
  const videoModule = modules.find(m => m.name === 'builder/video');
  const audioModule = modules.find(m => m.name === 'builder/audio');
  const variablesModule = modules.find(m => m.name === 'variables/index');
  const similarityModule = modules.find(m => m.name === 'similarity/index');
  const qualityModule = modules.find(m => m.name === 'quality/index');
  const parserModule = modules.find(m => m.name === 'parser/index');

  // Helper to generate interface/type declarations
  const generateInterfaceDecl = (entry: DocEntry): string => {
    if (entry.kind === 'interface' && entry.properties) {
      const props = entry.properties.map(p => {
        const sig = p.signature || `${p.name}: unknown`;
        return `    ${sig};`;
      }).join('\n');
      return `  export interface ${entry.name} {\n${props}\n  }`;
    }
    return '';
  };

  const generateTypeDecl = (entry: DocEntry): string => {
    if (entry.kind === 'type' && entry.signature) {
      return `  export ${entry.signature};`;
    }
    return '';
  };

  const generateClassDecl = (entry: DocEntry): string => {
    if (entry.kind === 'class' && entry.methods) {
      const methods = entry.methods.map(m => {
        const sig = m.signature || `${m.name}(): unknown`;
        return `    ${sig};`;
      }).join('\n');
      return `  export class ${entry.name} {\n${methods}\n  }`;
    }
    return '';
  };

  const generateFunctionDecl = (entry: DocEntry): string => {
    if (entry.kind === 'function' && entry.signature) {
      return `  export function ${entry.signature};`;
    }
    return '';
  };

  // Track already added declarations to avoid duplicates
  const addedTypes = new Set<string>();
  const addedInterfaces = new Set<string>();
  const addedClasses = new Set<string>();
  const addedFunctions = new Set<string>();

  // Process each module
  const processModule = (mod: ModuleDoc | undefined, sectionComment: string) => {
    if (!mod) return;
    
    lines.push('');
    lines.push(`  // ${sectionComment}`);
    
    // Types first (skip duplicates)
    for (const entry of mod.exports.filter(e => e.kind === 'type')) {
      if (addedTypes.has(entry.name)) continue;
      const decl = generateTypeDecl(entry);
      if (decl) {
        lines.push(decl);
        addedTypes.add(entry.name);
      }
    }
    
    // Interfaces (skip duplicates)
    for (const entry of mod.exports.filter(e => e.kind === 'interface')) {
      if (addedInterfaces.has(entry.name)) continue;
      const decl = generateInterfaceDecl(entry);
      if (decl) {
        lines.push(decl);
        addedInterfaces.add(entry.name);
      }
    }
    
    // Classes (skip duplicates)
    for (const entry of mod.exports.filter(e => e.kind === 'class')) {
      if (addedClasses.has(entry.name)) continue;
      const decl = generateClassDecl(entry);
      if (decl) {
        lines.push(decl);
        addedClasses.add(entry.name);
      }
    }
    
    // Functions (skip duplicates)
    for (const entry of mod.exports.filter(e => e.kind === 'function')) {
      if (addedFunctions.has(entry.name)) continue;
      const decl = generateFunctionDecl(entry);
      if (decl) {
        lines.push(decl);
        addedFunctions.add(entry.name);
      }
    }
  };

  // Process modules in order - audio first since it has the complete type definitions
  processModule(builderModule, 'BUILDER TYPES');
  processModule(chatModule, 'CHAT BUILDER TYPES');
  processModule(audioModule, 'AUDIO BUILDER TYPES');
  processModule(videoModule, 'VIDEO BUILDER TYPES');
  processModule(mediaModule, 'IMAGE BUILDER TYPES');
  
  // Generate templates namespace from object literal methods
  if (builderModule) {
    const templatesVar = builderModule.exports.find(e => e.kind === 'variable' && e.name === 'templates');
    if (templatesVar && templatesVar.methods && templatesVar.methods.length > 0) {
      lines.push('');
      lines.push('  // TEMPLATES - Pre-built prompt templates');
      lines.push('  export const templates: {');
      for (const method of templatesVar.methods) {
        const sig = method.signature || `${method.name}(): PromptBuilder`;
        // Extract just the function signature part
        const funcMatch = sig.match(/^(\w+)\((.*?)\):\s*(.+)$/);
        if (funcMatch) {
          const [, name, params, returnType] = funcMatch;
          // Default to PromptBuilder for templates if return type is 'any'
          const actualReturnType = returnType === 'any' ? 'PromptBuilder' : returnType;
          lines.push(`    ${name}: (${params}) => ${actualReturnType};`);
        }
      }
      lines.push('  };');
    }
  }

  // Utility namespaces
  if (variablesModule) {
    lines.push('');
    lines.push('  // UTILITY MODULES');
    lines.push('  export namespace variables {');
    for (const entry of variablesModule.exports.filter(e => e.kind === 'function')) {
      if (entry.signature) {
        lines.push(`    export function ${entry.signature};`);
      }
    }
    lines.push('  }');
  }

  if (similarityModule) {
    lines.push('  export namespace similarity {');
    for (const entry of similarityModule.exports.filter(e => e.kind === 'function')) {
      if (entry.signature) {
        lines.push(`    export function ${entry.signature};`);
      }
    }
    lines.push('  }');
  }

  if (qualityModule) {
    lines.push('  export namespace quality {');
    for (const entry of qualityModule.exports.filter(e => e.kind === 'function')) {
      if (entry.signature) {
        lines.push(`    export function ${entry.signature};`);
      }
    }
    lines.push('  }');
  }

  if (parserModule) {
    lines.push('  export namespace parser {');
    for (const entry of parserModule.exports.filter(e => e.kind === 'function')) {
      if (entry.signature) {
        lines.push(`    export function ${entry.signature};`);
      }
    }
    lines.push('  }');
  }

  lines.push('}');
  lines.push('`;');
  lines.push('');
  
  return lines.join('\n');
}

// Extract string literal options from type aliases and method parameters
function extractStringLiteralOptions(program: ts.Program, files: string[]): { methodOptions: Record<string, string[]>; typeAliases: Record<string, string[]> } {
  // Phase 1: Collect all type aliases and interface properties
  const typeAliases: Record<string, string[]> = {};
  const interfaceProps: Record<string, Record<string, string[]>> = {}; // InterfaceName -> { propName -> literals }
  
  function extractLiteralsFromType(type: ts.TypeNode, sourceFile: ts.SourceFile): string[] {
    const literals: string[] = [];
    
    if (ts.isUnionTypeNode(type)) {
      for (const member of type.types) {
        if (ts.isLiteralTypeNode(member) && member.literal && ts.isStringLiteral(member.literal)) {
          literals.push(member.literal.text);
        } else if (ts.isUnionTypeNode(member)) {
          literals.push(...extractLiteralsFromType(member, sourceFile));
        }
      }
    } else if (ts.isLiteralTypeNode(type) && type.literal && ts.isStringLiteral(type.literal)) {
      literals.push(type.literal.text);
    }
    
    return literals;
  }

  // First pass: collect type aliases and interface properties
  for (const filePath of files) {
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) continue;
    const sf = sourceFile; // Capture for closure

    function collectTypes(node: ts.Node) {
      if (ts.isTypeAliasDeclaration(node)) {
        const typeName = node.name.getText(sf);
        const literals = extractLiteralsFromType(node.type, sf);
        if (literals.length > 0) {
          typeAliases[typeName] = literals;
        }
      }

      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.getText(sf);
        interfaceProps[interfaceName] = interfaceProps[interfaceName] || {};
        
        for (const member of node.members) {
          if (ts.isPropertySignature(member) && member.name && member.type) {
            const propName = member.name.getText(sf);
            const literals = extractLiteralsFromType(member.type, sf);
            if (literals.length > 0) {
              interfaceProps[interfaceName][propName] = literals;
            }
          }
        }
      }

      ts.forEachChild(node, collectTypes);
    }

    collectTypes(sf);
  }

  // Phase 2: Extract method options by resolving parameter types
  const methodOptions: Record<string, string[]> = {};

  for (const filePath of files) {
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) continue;
    const sf = sourceFile; // Capture for closure

    function extractMethods(node: ts.Node) {
      if (ts.isClassDeclaration(node)) {
        for (const member of node.members) {
          if (ts.isMethodDeclaration(member) && member.name) {
            const methodName = member.name.getText(sf);
            
            for (const param of member.parameters) {
              if (!param.type) continue;
              
              let literals: string[] = [];
              
              // Direct literal union in parameter
              literals = extractLiteralsFromType(param.type, sf);
              
              // Type reference (e.g., MusicGenre)
              if (literals.length === 0 && ts.isTypeReferenceNode(param.type)) {
                const refName = param.type.typeName.getText(sf);
                if (typeAliases[refName]) {
                  literals = typeAliases[refName];
                }
              }
              
              // Indexed access type (e.g., AudioTempo['feel'])
              if (literals.length === 0 && ts.isIndexedAccessTypeNode(param.type)) {
                const objectType = param.type.objectType;
                const indexType = param.type.indexType;
                
                if (ts.isTypeReferenceNode(objectType) && ts.isLiteralTypeNode(indexType)) {
                  const interfaceName = objectType.typeName.getText(sf);
                  if (indexType.literal && ts.isStringLiteral(indexType.literal)) {
                    const propName = indexType.literal.text;
                    if (interfaceProps[interfaceName]?.[propName]) {
                      literals = interfaceProps[interfaceName][propName];
                    }
                  }
                }
              }
              
              // Union containing type references (e.g., MusicGenre | AudioGenre)
              if (literals.length === 0 && ts.isUnionTypeNode(param.type)) {
                for (const member of param.type.types) {
                  if (ts.isTypeReferenceNode(member)) {
                    const refName = member.typeName.getText(sf);
                    if (typeAliases[refName]) {
                      literals.push(...typeAliases[refName]);
                    }
                  }
                }
              }
              
              if (literals.length > 0) {
                // Deduplicate
                const uniqueLiterals = [...new Set(literals)];
                if (!methodOptions[methodName] || methodOptions[methodName].length < uniqueLiterals.length) {
                  methodOptions[methodName] = uniqueLiterals;
                }
              }
            }
          }
        }
      }

      ts.forEachChild(node, extractMethods);
    }

    extractMethods(sourceFile);
  }

  return { methodOptions, typeAliases };
}

// Generate type options mapping (TypeName -> valid values) for error messages
function generateTypeOptions(typeAliases: Record<string, string[]>): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('// Type name to valid options mapping for enhanced error messages');
  lines.push('export const TYPE_OPTIONS: Record<string, string[]> = {');
  
  // Sort keys for consistent output
  const sortedKeys = Object.keys(typeAliases).sort();
  
  for (const key of sortedKeys) {
    if (typeAliases[key].length > 0) {
      lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(typeAliases[key])},`);
    }
  }
  
  lines.push('};');
  
  return lines.join('\n');
}

// Generate method options file for Monaco autocomplete
function generateMethodOptions(options: Record<string, string[]>): string {
  const lines: string[] = [];
  
  lines.push('/**');
  lines.push(' * Auto-generated method options for Monaco autocomplete');
  lines.push(' * Generated from TypeScript source files via reflection');
  lines.push(' * DO NOT EDIT MANUALLY - run `npm run docs:generate` to regenerate');
  lines.push(' */');
  lines.push('');
  lines.push('export const METHOD_OPTIONS: Record<string, string[]> = {');
  
  // Collect all method names with their values, avoiding duplicates
  const methodMap: Record<string, string[]> = {};
  
  // Common method name aliases (type name -> method name)
  const methodAliases: Record<string, string[]> = {
    musicGenre: ['genre'],
    personaTone: ['tone'],
    personaExpertise: ['expertise'],
    outputLength: ['length'],
    outputStyle: ['style'],
    shotType: ['shot'],
    cameraAngle: ['angle'],
    cameraMovement: ['movement'],
    lensType: ['lens'],
    lightingType: ['lighting', 'lightingType'],
    focusType: ['focus'],
    bokehStyle: ['bokeh'],
    filterType: ['filter'],
    colorPalette: ['palette'],
    artStyle: ['medium', 'look', 'artStyle'],
    videoPacing: ['pacing'],
    videoTransition: ['transition'],
    vocalStyle: ['vocalStyle'],
    vocalLanguage: ['language'],
    weatherLighting: ['weather'],
    sensorFormat: ['sensor'],
    songSection: ['section'],
  };
  
  for (const [key, values] of Object.entries(options)) {
    if (values.length > 0) {
      // Convert type names to likely method names (camelCase, remove 'Type' suffix)
      const methodName = key.charAt(0).toLowerCase() + key.slice(1).replace(/Type$/, '');
      
      // Keep the longer list if there's a conflict
      if (!methodMap[methodName] || methodMap[methodName].length < values.length) {
        methodMap[methodName] = values;
      }
      
      // Also add aliases
      const aliases = methodAliases[methodName] || [];
      for (const alias of aliases) {
        if (!methodMap[alias] || methodMap[alias].length < values.length) {
          methodMap[alias] = values;
        }
      }
    }
  }
  
  // Sort keys for consistent output
  const sortedKeys = Object.keys(methodMap).sort();
  
  for (const key of sortedKeys) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(methodMap[key])},`);
  }
  
  lines.push('};');
  lines.push('');
  
  return lines.join('\n');
}

// Main execution
const srcDir = path.join(__dirname, '../src');
const outputPath = path.join(__dirname, '../API.md');
const sidebarOutputPath = path.resolve(__dirname, '../../../src/data/api-docs.ts');
const typeDefsOutputPath = path.resolve(__dirname, '../../../src/data/type-definitions.ts');
const methodOptionsOutputPath = path.resolve(__dirname, '../../../src/data/method-options.ts');

// Files to parse
const filesToParse = [
  path.join(srcDir, 'variables/index.ts'),
  path.join(srcDir, 'similarity/index.ts'),
  path.join(srcDir, 'quality/index.ts'),
  path.join(srcDir, 'parser/index.ts'),
  path.join(srcDir, 'builder/index.ts'),
  path.join(srcDir, 'builder/chat.ts'),
  path.join(srcDir, 'builder/media.ts'),
  path.join(srcDir, 'builder/video.ts'),
  path.join(srcDir, 'builder/audio.ts'),
];

// Filter to existing files
const existingFiles = filesToParse.filter(f => fs.existsSync(f));

// Create TypeScript program
const program = ts.createProgram(existingFiles, {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
});

// Parse each file
const modules: ModuleDoc[] = [];
for (const file of existingFiles) {
  try {
    const mod = parseSourceFile(file, program);
    if (mod.exports.length > 0) {
      // Use relative path as module name for clarity
      mod.name = path.relative(srcDir, file).replace(/\.ts$/, '').replace(/\\/g, '/');
      modules.push(mod);
    }
  } catch (error) {
    console.error(`Error parsing ${file}:`, error);
  }
}

// Generate and write markdown
const markdown = generateMarkdown(modules);
fs.writeFileSync(outputPath, markdown, 'utf-8');

// Generate and write TypeScript sidebar file
const sidebarTS = generateSidebarTS(modules);
// Ensure the data directory exists
const dataDir = path.dirname(sidebarOutputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(sidebarOutputPath, sidebarTS, 'utf-8');

// Generate and write TYPE_DEFINITIONS file
const typeDefs = generateTypeDefinitions(modules);
fs.writeFileSync(typeDefsOutputPath, typeDefs, 'utf-8');

// Extract string literal options and generate method options file
const { methodOptions, typeAliases } = extractStringLiteralOptions(program, existingFiles);
const methodOptionsContent = generateMethodOptions(methodOptions) + generateTypeOptions(typeAliases);
fs.writeFileSync(methodOptionsOutputPath, methodOptionsContent, 'utf-8');

console.log(`✅ Generated API documentation: ${outputPath}`);
console.log(`✅ Generated sidebar TypeScript: ${sidebarOutputPath}`);
console.log(`✅ Generated type definitions: ${typeDefsOutputPath}`);
console.log(`✅ Generated method options: ${methodOptionsOutputPath}`);
console.log(`   Parsed ${modules.length} modules with ${modules.reduce((acc, m) => acc + m.exports.length, 0)} exports`);
console.log(`   Extracted ${Object.keys(methodOptions).length} method options and ${Object.keys(typeAliases).length} type aliases`);
