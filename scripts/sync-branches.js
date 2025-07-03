#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VISIBILITY_FILE = path.join(__dirname, '..', '.github-pages-visibility.json');

function loadVisibility() {
  try {
    return JSON.parse(fs.readFileSync(VISIBILITY_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading visibility config:', error);
    process.exit(1);
  }
}

function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

function generateReadme(config) {
  const visibleFiles = Object.entries(config.visibility)
    .filter(([file, visible]) => visible)
    .map(([file, visible]) => file);
  
  const readmeContent = `# Context Selection Documentation

This documentation is automatically generated based on the MCP visibility configuration. Only files marked as visible are shown here.

## 📋 Available Documentation

`;

  let readmeBody = '';
  
  // Group files by directory
  const filesByDir = {};
  visibleFiles.forEach(file => {
    const dir = path.dirname(file);
    if (!filesByDir[dir]) filesByDir[dir] = [];
    filesByDir[dir].push(file);
  });
  
  // Generate links for each directory
  Object.keys(filesByDir).sort().forEach(dir => {
    if (dir !== '.') {
      readmeBody += `### ${dir.replace(/\//g, ' / ')}\n\n`;
    }
    
    filesByDir[dir].sort().forEach(file => {
      const fileName = path.basename(file, '.md');
      const displayName = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      readmeBody += `- [${displayName}](${file})\n`;
    });
    readmeBody += '\n';
  });
  
  const finalReadme = readmeContent + readmeBody + `
---

*This README.md is automatically generated when running \`npm run sync\`. Last updated: ${new Date().toISOString().split('T')[0]}*
`;
  
  fs.writeFileSync('README.md', finalReadme);
  console.log('✓ Generated README.md with visible file links');
}

function syncBranches() {
  const config = loadVisibility();
  const currentBranch = getCurrentBranch();
  
  console.log('Starting branch sync...');
  console.log(`Current branch: ${currentBranch}`);
  
  // Ensure we're on the all branch to start
  if (currentBranch !== 'all') {
    console.log('Switching to all branch...');
    execSync('git checkout all', { stdio: 'inherit' });
  }
  
  // Check for uncommitted changes and commit them
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('Committing changes in all branch...');
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Auto-commit changes before sync"', { stdio: 'inherit' });
    }
  } catch (error) {
    // Continue even if commit fails
  }
  
  // Get list of files that should be visible (true in config)
  const visibleFiles = Object.entries(config.visibility)
    .filter(([file, visible]) => visible)
    .map(([file, visible]) => file);
  
  console.log('\nFiles marked as visible:');
  visibleFiles.forEach(file => console.log(`  ✓ ${file}`));
  
  // Switch to main branch
  console.log('\nSwitching to main branch...');
  execSync('git checkout main', { stdio: 'inherit' });
  
  // Get current files in main branch
  const currentFiles = execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim() && Object.keys(config.visibility).includes(file));
  
  console.log('\nCurrent files in main branch:');
  currentFiles.forEach(file => console.log(`  ${file}`));
  
  // Files to remove (in main but not visible)
  const filesToRemove = currentFiles.filter(file => !visibleFiles.includes(file));
  
  // Files to add (visible but not in main)
  const filesToAdd = visibleFiles.filter(file => !currentFiles.includes(file));
  
  if (filesToRemove.length > 0) {
    console.log('\nRemoving files from main branch:');
    filesToRemove.forEach(file => {
      console.log(`  ✗ ${file}`);
      try {
        execSync(`git rm "${file}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`    (file may already be removed)`);
      }
    });
  }
  
  if (filesToAdd.length > 0) {
    console.log('\nAdding files to main branch:');
    filesToAdd.forEach(file => {
      console.log(`  ✓ ${file}`);
      try {
        // Check out the file from all branch
        execSync(`git checkout all -- "${file}"`, { stdio: 'inherit' });
        execSync(`git add "${file}"`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`    Error adding ${file}:`, error.message);
      }
    });
  }
  
  // Check if there are changes to commit
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('\nCommitting changes...');
      execSync('git commit -m "Sync main branch with visibility config"', { stdio: 'inherit' });
      console.log('✓ Changes committed successfully');
    } else {
      console.log('\n✓ No changes needed - main branch is already synced');
    }
  } catch (error) {
    console.log('Note: No changes to commit or commit failed');
  }
  
  // Check if --push flag was passed
  if (args.includes('--push')) {
    console.log('\nPushing changes to GitHub...');
    try {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✓ Successfully pushed main branch to GitHub');
    } catch (error) {
      console.log('✗ Failed to push to GitHub:', error.message);
    }
  }
  
  // Generate README.md with visible files
  generateReadme(config);
  
  console.log('\nBranch sync completed!');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node sync-branches.js [options]

Options:
  --help, -h    Show this help message
  
This script automatically syncs the main branch to only contain files
that are marked as visible (true) in .github-pages-visibility.json
`);
  process.exit(0);
}

syncBranches();