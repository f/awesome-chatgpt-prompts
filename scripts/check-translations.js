#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const enFile = path.join(messagesDir, 'en.json');

// Read English (source) translations
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Get all translation files
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

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

// Get value by dot-notation key
function getValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

const enKeys = flattenKeys(en);
console.log(`\n📋 English (en.json) has ${enKeys.length} translation keys\n`);

const missingByLang = {};
let totalMissing = 0;

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(messagesDir, file);
  const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const langKeys = flattenKeys(translations);
  
  const missing = enKeys.filter(key => !langKeys.includes(key));
  const extra = langKeys.filter(key => !enKeys.includes(key));
  
  if (missing.length > 0 || extra.length > 0) {
    missingByLang[lang] = { missing, extra };
    totalMissing += missing.length;
  }
});

if (totalMissing === 0) {
  console.log('✅ All translation files are complete!\n');
} else {
  console.log('❌ Missing translations found:\n');
  
  Object.entries(missingByLang).forEach(([lang, { missing, extra }]) => {
    if (missing.length > 0) {
      console.log(`\n🌐 ${lang.toUpperCase()} - Missing ${missing.length} keys:`);
      missing.forEach(key => {
        const enValue = getValue(en, key);
        console.log(`   ${key}: "${enValue}"`);
      });
    }
    if (extra.length > 0) {
      console.log(`\n🌐 ${lang.toUpperCase()} - ${extra.length} extra keys (not in en.json):`);
      extra.forEach(key => console.log(`   ${key}`));
    }
  });
  
  console.log(`\n📊 Summary: ${totalMissing} missing translations across ${Object.keys(missingByLang).length} files\n`);
}
