#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const messagesDir = path.join(__dirname, '..', 'messages');
const srcDir = path.join(__dirname, '..', 'src');
const enFile = path.join(messagesDir, 'en.json');

// Read English (source) translations
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Flatten nested object keys
function flattenKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      return [...acc, ...flattenKeys(obj[key], fullKey)];
    }
    return [...acc, fullKey];
  }, []);
}

// Get all translation keys
const allKeys = flattenKeys(en);
console.log(`\n📋 Checking ${allKeys.length} translation keys for usage...\n`);

// Get all source files
function getAllFiles(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Read all source file contents
const sourceFiles = getAllFiles(srcDir);
let allSourceContent = '';

sourceFiles.forEach(file => {
  allSourceContent += fs.readFileSync(file, 'utf8') + '\n';
});

// Also check component files that might use translations
const componentsContent = allSourceContent;

// Find unused keys
const unusedKeys = [];
const usedKeys = [];

// Common patterns for translation usage:
// - t("key") or t('key')
// - t("namespace.key") or t('namespace.key')
// - useTranslations("namespace") then t("key")
// - getTranslations("namespace") then t("key")
// - tNamespace("key") pattern (e.g., tCommon, tHomepage, tPrompts)

// Build a map of namespace aliases from patterns like:
// const tCommon = useTranslations("common")
// const tHomepage = await getTranslations("homepage")
// const t = useTranslations("admin.reports")  -- nested namespaces
const namespaceAliases = {};
const aliasPattern = /(?:const|let)\s+(t\w*)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(\s*["']([^"']+)["']\s*\)/g;
let match;
while ((match = aliasPattern.exec(allSourceContent)) !== null) {
  const alias = match[1];
  const namespace = match[2];  // Can be "common" or "admin.reports"
  if (!namespaceAliases[namespace]) {
    namespaceAliases[namespace] = [];
  }
  if (!namespaceAliases[namespace].includes(alias)) {
    namespaceAliases[namespace].push(alias);
  }
}

// Also add common patterns that might be used
// e.g., tCommon for "common", tHomepage for "homepage"
const commonAliasPatterns = {
  'common': ['tCommon'],
  'homepage': ['tHomepage'],
  'prompts': ['tPrompts'],
  'categories': ['tCategories'],
  'settings': ['tSettings'],
  'auth': ['tAuth'],
  'discovery': ['tDiscovery'],
  'feed': ['tFeed'],
  'collection': ['tCollection'],
  'search': ['tSearch'],
  'user': ['tUser'],
  'admin': ['tAdmin'],
  'tags': ['tTags'],
  'version': ['tVersion'],
  'vote': ['tVote'],
  'subscription': ['tSubscription'],
  'changeRequests': ['tChangeRequests'],
  'comments': ['tComments'],
  'errors': ['tErrors'],
  'nav': ['tNav'],
  'brand': ['tBrand'],
  'about': ['tAbout'],
  'ide': ['tIde'],
  'profile': ['tProfile'],
  'report': ['tReport'],
  'promptBuilder': ['tPromptBuilder'],
  'promptmasters': ['tPromptmasters'],
  'connectedPrompts': ['tConnectedPrompts'],
  'notifications': ['tNotifications'],
  'apiDocs': ['tApiDocs'],
};

Object.entries(commonAliasPatterns).forEach(([ns, aliases]) => {
  if (!namespaceAliases[ns]) {
    namespaceAliases[ns] = [];
  }
  aliases.forEach(alias => {
    if (!namespaceAliases[ns].includes(alias)) {
      namespaceAliases[ns].push(alias);
    }
  });
});

// Helper to check if a key pattern exists (with or without additional args)
// Matches: t("key"), t("key", ...), t('key'), t('key', ...)
// Also matches: t.rich("key", ...), t.raw("key", ...), etc.
// Also matches conditional: t(condition ? "key" : "other")
function checkKeyUsage(content, fnName, key) {
  const escapedKey = escapeRegex(key);
  // Patterns: fnName("key") or fnName("key", ...)
  // Also: fnName.rich("key", ...), fnName.raw("key", ...), fnName.markup("key", ...)
  // Also: ternary/conditional patterns like fnName(cond ? "key" : ...)
  const patterns = [
    new RegExp(`${fnName}\\s*\\(\\s*["']${escapedKey}["']\\s*[,)]`),
    new RegExp(`${fnName}\\s*\\(\\s*\`${escapedKey}\`\\s*[,)]`),
    new RegExp(`${fnName}\\.rich\\s*\\(\\s*["']${escapedKey}["']\\s*[,)]`),
    new RegExp(`${fnName}\\.raw\\s*\\(\\s*["']${escapedKey}["']\\s*[,)]`),
    new RegExp(`${fnName}\\.markup\\s*\\(\\s*["']${escapedKey}["']\\s*[,)]`),
    // Ternary patterns: t(cond ? "key" : ...) or t(... : "key")
    new RegExp(`${fnName}\\s*\\([^)]*\\?\\s*["']${escapedKey}["']`),
    new RegExp(`${fnName}\\s*\\([^)]*:\\s*["']${escapedKey}["']`),
  ];
  return patterns.some(pattern => pattern.test(content));
}

// Escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

allKeys.forEach(key => {
  const parts = key.split('.');
  const namespace = parts[0];
  const subKey = parts.slice(1).join('.');
  
  let isUsed = false;
  
  // Check for direct full key usage: t("namespace.key") or t("namespace.key", {...})
  if (checkKeyUsage(allSourceContent, 't', key)) {
    isUsed = true;
  }
  
  // Check for namespace + subkey usage with t()
  // e.g., useTranslations("prompts") then t("create") or t("create", {...})
  if (!isUsed && subKey && checkKeyUsage(allSourceContent, 't', subKey)) {
    isUsed = true;
  }
  
  // Check for aliased namespace patterns like tCommon("error"), tHomepage("title", {...})
  if (!isUsed && subKey && namespaceAliases[namespace]) {
    for (const alias of namespaceAliases[namespace]) {
      if (checkKeyUsage(allSourceContent, alias, subKey)) {
        isUsed = true;
        break;
      }
    }
  }
  
  // Check for nested namespace patterns like useTranslations("admin.reports")
  // Key: "admin.reports.markedReviewed" -> with t("markedReviewed")
  if (!isUsed) {
    for (const [nsPath, aliases] of Object.entries(namespaceAliases)) {
      if (nsPath.includes('.') && key.startsWith(nsPath + '.')) {
        const nestedSubKey = key.slice(nsPath.length + 1);
        for (const alias of aliases) {
          if (checkKeyUsage(allSourceContent, alias, nestedSubKey)) {
            isUsed = true;
            break;
          }
        }
        if (isUsed) break;
      }
    }
  }
  
  // Also check for the key as a plain string (props, etc.)
  if (!isUsed) {
    if (allSourceContent.includes(`"${key}"`) || allSourceContent.includes(`'${key}'`)) {
      isUsed = true;
    }
  }
  
  // Check for template literal patterns like t(`prefix.${var}`)
  // If key is "categories.sort.newest", check for t(`sort.${...}`) patterns
  if (!isUsed && subKey) {
    const subParts = subKey.split('.');
    if (subParts.length >= 2) {
      // Check for patterns like t(`sort.${option}`) matching "sort.newest"
      const prefix = subParts.slice(0, -1).join('.');
      const templatePattern = new RegExp(`t\\s*\\(\\\`${escapeRegex(prefix)}\\.\\$\\{`);
      if (templatePattern.test(allSourceContent)) {
        isUsed = true;
      }
      // Also check with aliases
      if (!isUsed && namespaceAliases[namespace]) {
        for (const alias of namespaceAliases[namespace]) {
          const aliasTemplatePattern = new RegExp(`${alias}\\s*\\(\\\`${escapeRegex(prefix)}\\.\\$\\{`);
          if (aliasTemplatePattern.test(allSourceContent)) {
            isUsed = true;
            break;
          }
        }
      }
    }
  }
  
  // Check for nested namespace template patterns
  if (!isUsed) {
    for (const [nsPath, aliases] of Object.entries(namespaceAliases)) {
      if (nsPath.includes('.') && key.startsWith(nsPath + '.')) {
        const nestedSubKey = key.slice(nsPath.length + 1);
        const nestedParts = nestedSubKey.split('.');
        if (nestedParts.length >= 2) {
          const prefix = nestedParts.slice(0, -1).join('.');
          for (const alias of aliases) {
            const templatePattern = new RegExp(`${alias}\\s*\\(\\\`${escapeRegex(prefix)}\\.\\$\\{`);
            if (templatePattern.test(allSourceContent)) {
              isUsed = true;
              break;
            }
          }
        }
        if (isUsed) break;
      }
    }
  }
  
  if (isUsed) {
    usedKeys.push(key);
  } else {
    unusedKeys.push(key);
  }
});

// Final verification: check if the last part of the key exists anywhere in source
// If "alreadyReported" doesn't appear at all, "report.alreadyReported" is definitely unused
const confirmedUnused = [];
const maybeUnused = [];

unusedKeys.forEach(key => {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Check if lastPart appears as a quoted string anywhere
  const hasQuoted = allSourceContent.includes(`"${lastPart}"`) || 
                    allSourceContent.includes(`'${lastPart}'`) ||
                    allSourceContent.includes(`\`${lastPart}\``);
  
  if (hasQuoted) {
    maybeUnused.push(key);
  } else {
    confirmedUnused.push(key);
  }
});

// Group unused keys by namespace
const unusedByNamespace = {};
unusedKeys.forEach(key => {
  const namespace = key.split('.')[0];
  if (!unusedByNamespace[namespace]) {
    unusedByNamespace[namespace] = [];
  }
  unusedByNamespace[namespace].push(key);
});

// Group confirmed unused by namespace
const confirmedByNamespace = {};
confirmedUnused.forEach(key => {
  const namespace = key.split('.')[0];
  if (!confirmedByNamespace[namespace]) {
    confirmedByNamespace[namespace] = [];
  }
  confirmedByNamespace[namespace].push(key);
});

// Group maybe unused by namespace  
const maybeByNamespace = {};
maybeUnused.forEach(key => {
  const namespace = key.split('.')[0];
  if (!maybeByNamespace[namespace]) {
    maybeByNamespace[namespace] = [];
  }
  maybeByNamespace[namespace].push(key);
});

// Output results
if (unusedKeys.length === 0) {
  console.log('✅ All translation keys are being used!\n');
} else {
  // Show confirmed unused first
  if (confirmedUnused.length > 0) {
    console.log(`\n🗑️  CONFIRMED UNUSED (${confirmedUnused.length} keys - safe to remove):\n`);
    Object.entries(confirmedByNamespace)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([namespace, keys]) => {
        console.log(`📁 ${namespace} (${keys.length}):`);
        keys.forEach(key => {
          const value = key.split('.').reduce((obj, k) => obj?.[k], en);
          const displayValue = typeof value === 'string' 
            ? value.length > 50 ? value.substring(0, 50) + '...' : value
            : '[object]';
          console.log(`   ${key}: "${displayValue}"`);
        });
      });
  }
  
  // Show maybe unused
  if (maybeUnused.length > 0) {
    console.log(`\n⚠️  MAYBE UNUSED (${maybeUnused.length} keys - review carefully):\n`);
    Object.entries(maybeByNamespace)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([namespace, keys]) => {
        console.log(`📁 ${namespace} (${keys.length}):`);
        keys.forEach(key => {
          const value = key.split('.').reduce((obj, k) => obj?.[k], en);
          const displayValue = typeof value === 'string' 
            ? value.length > 50 ? value.substring(0, 50) + '...' : value
            : '[object]';
          console.log(`   ${key}: "${displayValue}"`);
        });
      });
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total keys: ${allKeys.length}`);
  console.log(`   Used keys: ${usedKeys.length}`);
  console.log(`   Confirmed unused: ${confirmedUnused.length}`);
  console.log(`   Maybe unused: ${maybeUnused.length}`);
  console.log(`\n💡 "Confirmed unused" keys don't appear anywhere in source code.`);
  console.log(`   "Maybe unused" keys have the final part appearing somewhere but couldn't be matched to a t() call.\n`);
}

// Optional: Output to file if --output flag is provided
if (process.argv.includes('--output')) {
  const outputFile = path.join(__dirname, 'unused-translations.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    total: allKeys.length,
    used: usedKeys.length,
    unused: unusedKeys.length,
    unusedKeys: unusedByNamespace
  }, null, 2));
  console.log(`📄 Results saved to ${outputFile}\n`);
}
