#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VISIBILITY_CONFIG = path.join(__dirname, '..', '.mcp-visibility.json');

/**
 * Branch-based visibility toggle system
 * - 'all' branch contains all project files
 * - 'main' branch contains only files marked as visible
 * - Toggling files updates main branch from all branch
 */

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
    console.log('✅ Visibility configuration updated');
  } catch (error) {
    console.error(`❌ Error saving visibility config: ${error.message}`);
    process.exit(1);
  }
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`❌ Error getting current branch: ${error.message}`);
    process.exit(1);
  }
}

function switchBranch(branch) {
  try {
    execSync(`git checkout ${branch}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Error switching to branch ${branch}: ${error.message}`);
    process.exit(1);
  }
}

function getVisibleFiles(config) {
  const visibleFiles = [];
  
  // Add explicitly visible files
  for (const [file, visible] of Object.entries(config.visibility || {})) {
    if (visible) {
      visibleFiles.push(file);
    }
  }
  
  // Add files matching include patterns
  if (config.patterns && config.patterns.include) {
    for (const pattern of config.patterns.include) {
      try {
        // Convert glob pattern to find command
        const findPattern = pattern.replace('*', '\\*');
        const command = `find . -path "./.git" -prune -o -path "${findPattern}" -type f -print`;
        const matches = execSync(command, { encoding: 'utf8' })
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace('./', ''));
        
        visibleFiles.push(...matches);
      } catch (error) {
        console.warn(`⚠️ Warning: Could not process pattern ${pattern}`);
      }
    }
  }
  
  return [...new Set(visibleFiles)]; // Remove duplicates
}

function updateMainBranch(config) {
  const currentBranch = getCurrentBranch();
  const visibleFiles = getVisibleFiles(config);
  
  console.log(`🔄 Updating main branch with ${visibleFiles.length} visible files...`);
  
  // Ensure we're on the all branch
  if (currentBranch !== 'all') {
    switchBranch('all');
  }
  
  // Switch to main branch
  switchBranch('main');
  
  try {
    // Remove all files from main branch
    execSync('git rm -r --cached .', { stdio: 'pipe' });
    
    // Copy visible files from all branch
    for (const file of visibleFiles) {
      try {
        execSync(`git checkout all -- "${file}"`, { stdio: 'pipe' });
        console.log(`✅ Added: ${file}`);
      } catch (error) {
        console.warn(`⚠️ Warning: Could not add ${file} (may not exist)`);
      }
    }
    
    // Always keep .gitignore
    try {
      execSync('git checkout all -- .gitignore', { stdio: 'pipe' });
    } catch (error) {
      // .gitignore might not exist, that's okay
    }
    
    // Commit changes
    const commitMessage = `Update visible files

Files now visible: ${visibleFiles.length}
${visibleFiles.map(f => `- ${f}`).join('\n')}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    execSync(`git add .`, { stdio: 'inherit' });
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    execSync(`git push origin main`, { stdio: 'inherit' });
    
    console.log('🎉 Main branch updated successfully!');
    
  } catch (error) {
    console.error(`❌ Error updating main branch: ${error.message}`);
    process.exit(1);
  }
  
  // Return to original branch
  if (currentBranch !== 'main') {
    switchBranch(currentBranch);
  }
}

function toggleFile(filePath, visible) {
  console.log(`🔄 ${visible ? 'Showing' : 'Hiding'} file: ${filePath}`);
  
  const config = loadVisibilityConfig();
  config.visibility = config.visibility || {};
  config.visibility[filePath] = visible;
  
  saveVisibilityConfig(config);
  updateMainBranch(config);
}

function showStatus() {
  const config = loadVisibilityConfig();
  const visibleFiles = getVisibleFiles(config);
  
  console.log('📊 Current Visibility Status:');
  console.log(`📁 Visible files: ${visibleFiles.length}`);
  console.log('');
  
  if (visibleFiles.length > 0) {
    console.log('✅ Visible files:');
    visibleFiles.forEach(file => console.log(`   ${file}`));
  }
  
  console.log('');
  console.log('🔧 Patterns:');
  if (config.patterns) {
    if (config.patterns.include) {
      console.log('   Include patterns:');
      config.patterns.include.forEach(pattern => console.log(`     ${pattern}`));
    }
    if (config.patterns.exclude) {
      console.log('   Exclude patterns:');
      config.patterns.exclude.forEach(pattern => console.log(`     ${pattern}`));
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Branch-based Visibility Toggle');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/branch-toggle-visibility.js status');
    console.log('  node scripts/branch-toggle-visibility.js show <file-path>');
    console.log('  node scripts/branch-toggle-visibility.js hide <file-path>');
    console.log('  node scripts/branch-toggle-visibility.js sync');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/branch-toggle-visibility.js show package.json');
    console.log('  node scripts/branch-toggle-visibility.js hide test/descriptions/overview.md');
    console.log('  node scripts/branch-toggle-visibility.js sync');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'status':
      showStatus();
      break;
      
    case 'show':
      if (args.length < 2) {
        console.error('❌ Error: Please specify a file path');
        process.exit(1);
      }
      toggleFile(args[1], true);
      break;
      
    case 'hide':
      if (args.length < 2) {
        console.error('❌ Error: Please specify a file path');
        process.exit(1);
      }
      toggleFile(args[1], false);
      break;
      
    case 'sync':
      const config = loadVisibilityConfig();
      updateMainBranch(config);
      break;
      
    default:
      console.error(`❌ Error: Unknown command '${command}'`);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { toggleFile, showStatus, updateMainBranch };