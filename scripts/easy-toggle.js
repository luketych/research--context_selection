#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VISIBILITY_CONFIG = path.join(__dirname, '..', '.mcp-visibility.json');

function autoCommit() {
  try {
    // Check if there are any changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      execSync('git add .', { stdio: 'pipe' });
      execSync('git commit -m "Auto-commit: visibility toggle changes"', { stdio: 'pipe' });
      console.log('📝 Auto-committed changes');
    }
  } catch (error) {
    // Ignore commit errors - not critical
  }
}

function ensureOnAllBranch() {
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (currentBranch !== 'all') {
      autoCommit(); // Commit any changes before switching
      execSync('git checkout all', { stdio: 'pipe' });
      console.log('🔄 Switched to all branch');
    }
  } catch (error) {
    console.error(`❌ Error switching to all branch: ${error.message}`);
    process.exit(1);
  }
}

function loadVisibilityConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(VISIBILITY_CONFIG, 'utf8'));
    return config;
  } catch (error) {
    console.error(`❌ Error loading visibility config: ${error.message}`);
    process.exit(1);
  }
}

function saveVisibilityConfig(config) {
  try {
    fs.writeFileSync(VISIBILITY_CONFIG, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(`❌ Error saving visibility config: ${error.message}`);
    process.exit(1);
  }
}

function getVisibleFiles(config) {
  const visibleFiles = [];
  
  // Add files matching include patterns first
  if (config.patterns && config.patterns.include) {
    for (const pattern of config.patterns.include) {
      try {
        const globPattern = pattern.replace(/\*/g, '**/*');
        const command = `find . -path "./.git" -prune -o -name "${pattern.split('/').pop()}" -type f -print`;
        const matches = execSync(command, { encoding: 'utf8' })
          .split('\n')
          .filter(line => line.trim() && line.includes(pattern.replace('*.md', '').replace('*', '')))
          .map(line => line.replace('./', ''));
        
        visibleFiles.push(...matches);
      } catch (error) {
        // Ignore pattern errors
      }
    }
  }
  
  // Then apply explicit visibility overrides
  for (const [file, visible] of Object.entries(config.visibility || {})) {
    if (visible && !visibleFiles.includes(file)) {
      visibleFiles.push(file);
    } else if (!visible && visibleFiles.includes(file)) {
      // Remove explicitly hidden files
      const index = visibleFiles.indexOf(file);
      visibleFiles.splice(index, 1);
    }
  }
  
  return [...new Set(visibleFiles)]; // Remove duplicates
}

function updateMainBranch(config) {
  const visibleFiles = getVisibleFiles(config);
  
  console.log(`🔄 Updating main branch (${visibleFiles.length} files visible)...`);
  
  try {
    // Auto-commit any changes on all branch
    autoCommit();
    
    // Switch to main branch
    execSync('git checkout main', { stdio: 'pipe' });
    
    // Remove all files from main branch
    execSync('git rm -rf .', { stdio: 'pipe' });
    
    // Copy visible files from all branch
    for (const file of visibleFiles) {
      try {
        execSync(`git checkout all -- "${file}"`, { stdio: 'pipe' });
        console.log(`✅ ${file}`);
      } catch (error) {
        console.warn(`⚠️ Could not add ${file}`);
      }
    }
    
    // Always keep .gitignore
    try {
      execSync('git checkout all -- .gitignore', { stdio: 'pipe' });
    } catch (error) {
      // .gitignore might not exist
    }
    
    // Commit and push changes
    execSync('git add .', { stdio: 'pipe' });
    try {
      execSync(`git commit -m "Update visible files (${visibleFiles.length} files)"`, { stdio: 'pipe' });
      execSync('git push origin main', { stdio: 'pipe' });
      console.log('🎉 Main branch updated and pushed!');
    } catch (error) {
      // No changes to commit
      console.log('✅ No changes needed');
    }
    
    // Return to all branch
    execSync('git checkout all', { stdio: 'pipe' });
    
  } catch (error) {
    console.error(`❌ Error updating main branch: ${error.message}`);
    process.exit(1);
  }
}

function toggleFile(filePath, visible) {
  console.log(`${visible ? '👁️  Showing' : '🙈 Hiding'} ${filePath}`);
  
  // Ensure we're on the all branch
  ensureOnAllBranch();
  
  const config = loadVisibilityConfig();
  config.visibility = config.visibility || {};
  config.visibility[filePath] = visible;
  
  saveVisibilityConfig(config);
  updateMainBranch(config);
}

function showStatus() {
  ensureOnAllBranch();
  const config = loadVisibilityConfig();
  const visibleFiles = getVisibleFiles(config);
  
  console.log(`📊 ${visibleFiles.length} files currently visible:`);
  visibleFiles.forEach(file => console.log(`   ✅ ${file}`));
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎛️  Easy Toggle - MCP Visibility Control');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/easy-toggle.js show <file>');
    console.log('  node scripts/easy-toggle.js hide <file>');
    console.log('  node scripts/easy-toggle.js status');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/easy-toggle.js show package.json');
    console.log('  node scripts/easy-toggle.js hide test/descriptions/overview.md');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'status':
      showStatus();
      break;
      
    case 'show':
      if (args.length < 2) {
        console.error('❌ Please specify a file path');
        process.exit(1);
      }
      toggleFile(args[1], true);
      break;
      
    case 'hide':
      if (args.length < 2) {
        console.error('❌ Please specify a file path');
        process.exit(1);
      }
      toggleFile(args[1], false);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}