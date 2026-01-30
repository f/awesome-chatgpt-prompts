import { spawn, execSync } from 'child_process';
import { existsSync, rmSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const REPO = 'f/prompts.chat';

interface NewOptions {
  directory: string;
}

function removeFiles(baseDir: string): void {
  const toRemove = [
    '.github',
    '.claude',
    'packages',
  ];

  // Remove directories
  for (const item of toRemove) {
    const itemPath = join(baseDir, item);
    if (existsSync(itemPath)) {
      console.log(`  Removing ${item}/`);
      rmSync(itemPath, { recursive: true, force: true });
    }
  }

  // Remove scripts/generate* and scripts/rebuild* files
  const scriptsDir = join(baseDir, 'scripts');
  if (existsSync(scriptsDir)) {
    const files = readdirSync(scriptsDir);
    for (const file of files) {
      if (file.startsWith('generate') || file.startsWith('rebuild')) {
        const filePath = join(scriptsDir, file);
        console.log(`  Removing scripts/${file}`);
        rmSync(filePath, { force: true });
      }
    }
  }
}

function runSetup(baseDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const setupScript = join(baseDir, 'scripts', 'setup.js');
    
    if (!existsSync(setupScript)) {
      console.log('\n⚠ Setup script not found, skipping interactive setup.');
      resolve();
      return;
    }

    console.log('\n🚀 Starting interactive setup...\n');
    
    const child = spawn('node', [setupScript], {
      cwd: baseDir,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Setup exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

export async function createNew(options: NewOptions): Promise<void> {
  const targetDir = resolve(process.cwd(), options.directory);

  if (existsSync(targetDir)) {
    const files = readdirSync(targetDir);
    if (files.length > 0) {
      console.error(`\n❌ Directory "${options.directory}" already exists and is not empty.`);
      process.exit(1);
    }
  }

  console.log('\n📦 Creating new prompts.chat instance...\n');

  // Use degit to clone the repo
  try {
    console.log(`  Cloning ${REPO}...`);
    execSync(`npx degit ${REPO} "${targetDir}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Failed to clone repository. Make sure you have internet connection.');
    process.exit(1);
  }

  // Remove unnecessary files
  console.log('\n🧹 Cleaning up files...\n');
  removeFiles(targetDir);

  // Install dependencies
  console.log('\n📥 Installing dependencies...\n');
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  } catch (error) {
    console.error('\n⚠ Failed to install dependencies. You can run "npm install" manually.');
  }

  // Run the setup script
  try {
    await runSetup(targetDir);
  } catch (error) {
    console.error('\n⚠ Setup failed:', (error as Error).message);
  }

  console.log('\n✅ Done! Your prompts.chat instance is ready.\n');
  console.log(`   cd ${options.directory}`);
  console.log('   npm run dev\n');
}
