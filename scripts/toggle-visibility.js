#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VISIBILITY_FILE = path.join(__dirname, '..', '.github-pages-visibility.json');

function loadVisibility() {
  try {
    return JSON.parse(fs.readFileSync(VISIBILITY_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading visibility config:', error);
    process.exit(1);
  }
}

function saveVisibility(config) {
  fs.writeFileSync(VISIBILITY_FILE, JSON.stringify(config, null, 2));
}

function toggleFile(filePath, state) {
  const config = loadVisibility();
  
  if (state === 'on') {
    config.visibility[filePath] = true;
  } else if (state === 'off') {
    config.visibility[filePath] = false;
  } else {
    config.visibility[filePath] = !config.visibility[filePath];
  }
  
  saveVisibility(config);
  console.log(`File ${filePath} is now ${config.visibility[filePath] ? 'visible' : 'hidden'}`);
}

function listVisibility() {
  const config = loadVisibility();
  console.log('\nFile Visibility Status:');
  console.log('─'.repeat(50));
  
  for (const [file, visible] of Object.entries(config.visibility)) {
    const status = visible ? '✓ visible' : '✗ hidden';
    console.log(`${status.padEnd(12)} ${file}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--list') {
  listVisibility();
} else {
  const filePath = args[0];
  const state = args[1]?.replace('--', '');
  toggleFile(filePath, state);
}
