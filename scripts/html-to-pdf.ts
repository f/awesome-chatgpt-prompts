#!/usr/bin/env npx tsx
/**
 * Convert HTML book to PDF using Puppeteer
 * 
 * Usage:
 *   npx tsx scripts/html-to-pdf.ts [locale]
 *   npx tsx scripts/html-to-pdf.ts [locale] --print  # Print-ready with bleed
 * 
 * Prerequisites:
 *   npm install puppeteer (run once)
 * 
 * Examples:
 *   npx tsx scripts/html-to-pdf.ts        # Convert English version
 *   npx tsx scripts/html-to-pdf.ts tr     # Convert Turkish version
 *   npx tsx scripts/html-to-pdf.ts --all  # Convert all available HTML files
 *   npx tsx scripts/html-to-pdf.ts --all --print  # All locales, print-ready
 */

import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public/book-pdf');

// Print dimensions
const SCREEN_WIDTH = '6in';
const SCREEN_HEIGHT = '9in';
const PRINT_WIDTH = '6.25in';   // 6 + 0.125*2 bleed
const PRINT_HEIGHT = '9.25in';  // 9 + 0.125*2 bleed

async function convertToPdf(htmlPath: string, pdfPath: string, printReady: boolean): Promise<void> {
  // Dynamic import to avoid issues if puppeteer isn't installed
  const puppeteer = await import('puppeteer');
  
  const mode = printReady ? 'print-ready' : 'screen';
  console.log(`  🔄 Converting ${path.basename(htmlPath)} to PDF (${mode})...`);
  
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Load the HTML file via file:// URL for better CJK support
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'load',
      timeout: 60000,
    });
    
    if (printReady) {
      // Print-ready: bleed page size, no header/footer, prefer CSS page size
      // Print-ready: margins = screen margins + bleed (0.125in) + safe zone
      await page.pdf({
        path: pdfPath,
        width: PRINT_WIDTH,
        height: PRINT_HEIGHT,
        printBackground: true,
        margin: {
          top: '0.7in',
          right: '0.65in',
          bottom: '0.75in',
          left: '0.65in',
        },
      });
    } else {
      // Screen version: standard margins with page numbers
      try {
        await page.pdf({
          path: pdfPath,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          printBackground: true,
          margin: {
            top: '0.55in',
            right: '0.5in',
            bottom: '0.6in',
            left: '0.5in',
          },
          displayHeaderFooter: true,
          headerTemplate: '<div></div>',
          footerTemplate: `
            <div style="font-family: 'Palatino Linotype', Georgia, serif; font-size: 9px; width: 100%; text-align: center; color: #666; padding-top: 0.25in;">
              <span class="pageNumber"></span>
            </div>
          `,
        });
      } catch {
        // Retry without header/footer (can fail with CJK content)
        console.log(`  ⚠ Retrying without page numbers...`);
        await page.pdf({
          path: pdfPath,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          printBackground: true,
          margin: {
            top: '0.55in',
            right: '0.5in',
            bottom: '0.6in',
            left: '0.5in',
          },
        });
      }
    }
    
    const stats = fs.statSync(pdfPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`  ✅ PDF saved: ${pdfPath} (${sizeMB} MB)`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const convertAll = args.includes('--all');
  const printReady = args.includes('--print');
  const requestedLocale = args.find(arg => !arg.startsWith('--')) || 'en';
  
  const mode = printReady ? '(print-ready)' : '(screen)';
  console.log(`📄 HTML to PDF Converter ${mode}\n`);
  
  // Check if puppeteer is available
  try {
    await import('puppeteer');
  } catch (e) {
    console.error('❌ Puppeteer is not installed.');
    console.log('\n   Run: npm install puppeteer\n');
    process.exit(1);
  }
  
  // Check output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(`❌ Output directory not found: ${OUTPUT_DIR}`);
    console.log('\n   Run: npx tsx scripts/generate-book-pdf.ts first\n');
    process.exit(1);
  }
  
  // Get HTML files to convert -- match print suffix
  const suffix = printReady ? '-print' : '';
  const pattern = suffix ? `-print.html` : '.html';
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => {
    if (printReady) return f.endsWith('-print.html');
    return f.endsWith('.html') && !f.endsWith('-print.html');
  });
  
  if (files.length === 0) {
    console.error(`❌ No ${printReady ? 'print-ready ' : ''}HTML files found.`);
    console.log(`\n   Run: npx tsx scripts/generate-book-pdf.ts ${printReady ? '--print ' : ''}first\n`);
    process.exit(1);
  }
  
  const filesToConvert = convertAll
    ? files
    : files.filter(f => f === `book-${requestedLocale}${suffix}.html`);
  
  if (filesToConvert.length === 0) {
    console.error(`❌ HTML file for locale '${requestedLocale}' not found.`);
    console.log(`\n   Available: ${files.join(', ')}`);
    process.exit(1);
  }
  
  for (const htmlFile of filesToConvert) {
    const htmlPath = path.join(OUTPUT_DIR, htmlFile);
    const pdfPath = htmlPath.replace('.html', '.pdf');
    
    await convertToPdf(htmlPath, pdfPath, printReady);
  }
  
  console.log('\n✅ All conversions complete!\n');
}

main().catch(console.error);
