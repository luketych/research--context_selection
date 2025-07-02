#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { updateTimestamp } = require('./update-timestamp.js');

/**
 * Recursively find all .md files in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} excludes - Patterns to exclude
 * @returns {string[]} Array of file paths
 */
function findMdFiles(dir, excludes = []) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip excluded directories
        if (!excludes.some(exclude => item.includes(exclude))) {
          traverse(fullPath);
        }
      } else if (item.endsWith('.md')) {
        // Skip excluded files
        if (!excludes.some(exclude => item.includes(exclude))) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const projectRoot = path.join(__dirname, '..');
const descriptionsDir = path.join(projectRoot, 'descriptions');

// Files to exclude from timestamp updates
const excludes = ['CLAUDE.md', 'test/', 'node_modules/', '.git/'];

console.log('🕒 Updating timestamps for all markdown files in descriptions/...\n');

const mdFiles = findMdFiles(descriptionsDir, excludes);

let updated = 0;
let skipped = 0;

for (const filePath of mdFiles) {
  const relativePath = path.relative(projectRoot, filePath);
  if (updateTimestamp(filePath)) {
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   ✓ Updated: ${updated} files`);
console.log(`   ⚠ Skipped: ${skipped} files`);
console.log(`   📁 Total processed: ${mdFiles.length} files`);

if (skipped > 0) {
  console.log(`\n💡 Skipped files may not have frontmatter. Add manually with:`);
  console.log(`   ---`);
  console.log(`   Created: YYYY-MM-DD HH:MM:SS PST`);
  console.log(`   Updated: YYYY-MM-DD HH:MM:SS PST`);
  console.log(`   ---`);
}