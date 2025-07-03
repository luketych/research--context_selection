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

function updateMainBranchForPages(config) {
  const visibleFiles = getVisibleFiles(config);
  
  console.log(`🔄 Updating main branch for GitHub Pages (${visibleFiles.length} files visible)...`);
  
  try {
    // Auto-commit any changes on all branch
    autoCommit();
    
    // Switch to main branch
    execSync('git checkout main', { stdio: 'pipe' });
    
    // Remove all files from main branch (except .git and .github)
    execSync('find . -type f -not -path "./.git/*" -not -path "./.github/*" -delete', { stdio: 'pipe' });
    execSync('find . -type d -empty -not -path "./.git/*" -not -path "./.github/*" -delete', { stdio: 'pipe' });
    
    // Copy visible files from all branch
    for (const file of visibleFiles) {
      try {
        // Create directory structure
        const dir = path.dirname(file);
        if (dir !== '.' && dir !== '') {
          execSync(`mkdir -p "${dir}"`, { stdio: 'pipe' });
        }
        
        execSync(`git checkout all -- "${file}"`, { stdio: 'pipe' });
        console.log(`✅ ${file}`);
      } catch (error) {
        console.warn(`⚠️ Could not add ${file}: ${error.message}`);
      }
    }
    
    // Always keep important files for Pages
    const alwaysIncludeFiles = ['.gitignore', '.github/workflows/pages.yml'];
    for (const file of alwaysIncludeFiles) {
      try {
        const dir = path.dirname(file);
        if (dir !== '.' && dir !== '') {
          execSync(`mkdir -p "${dir}"`, { stdio: 'pipe' });
        }
        execSync(`git checkout all -- "${file}"`, { stdio: 'pipe' });
        console.log(`📄 Added ${file} (always included)`);
      } catch (error) {
        // File might not exist on all branch
        console.log(`⚠️ ${file} not found on all branch`);
      }
    }
    
    // Commit and push changes to trigger Pages deployment
    execSync('git add .', { stdio: 'pipe' });
    try {
      const commitMessage = `Deploy ${visibleFiles.length} visible files to GitHub Pages

Visible files:
${visibleFiles.map(f => `- ${f}`).join('\n')}

This deployment excludes git history access.
Pages URL: https://luketych.github.io/research--context_selection`;

      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
      execSync('git push origin main', { stdio: 'pipe' });
      console.log('🎉 Main branch updated and pushed!');
      console.log('🚀 GitHub Pages deployment will start automatically');
      console.log('🌐 Pages URL: https://luketych.github.io/research--context_selection');
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

function updatePagesConfig(config) {
  try {
    const { updatePagesMCPConfig } = require('./apply-pages-changes.js');
    if (updatePagesMCPConfig(config)) {
      console.log('✅ Updated Pages MCP configuration');
    }
  } catch (error) {
    console.warn(`⚠️ Could not update Pages config: ${error.message}`);
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
  
  // Update Pages configuration
  updatePagesConfig(config);
  
  // Update main branch for Pages deployment
  updateMainBranchForPages(config);
}

function showStatus() {
  ensureOnAllBranch();
  const config = loadVisibilityConfig();
  const visibleFiles = getVisibleFiles(config);
  
  console.log('🌐 GitHub Pages Visibility Status');
  console.log('=================================');
  console.log(`📊 ${visibleFiles.length} files currently visible via Pages:`);
  visibleFiles.forEach(file => console.log(`   ✅ ${file}`));
  
  console.log('\n🔒 Security Benefits:');
  console.log('   • Git history not accessible via Pages');
  console.log('   • Only main branch content exposed');
  console.log('   • Hidden files completely excluded');
  
  console.log('\n🌐 Pages URL: https://luketych.github.io/research--context_selection');
}

function deployToPages() {
  console.log('🚀 Triggering GitHub Pages deployment...');
  
  ensureOnAllBranch();
  const config = loadVisibilityConfig();
  
  // Update everything and deploy
  updatePagesConfig(config);
  updateMainBranchForPages(config);
  
  console.log('\n✨ Deployment complete!');
  console.log('💡 GitHub Pages will be updated within a few minutes');
  console.log('🌐 Monitor deployment: https://github.com/luketych/research--context_selection/actions');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎛️  Easy Toggle - GitHub Pages MCP Visibility Control');
    console.log('');
    console.log('This version deploys to GitHub Pages instead of using direct repo access.');
    console.log('Pages deployment eliminates git history access completely.');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/easy-toggle-pages.js show <file>      # Make file visible');
    console.log('  node scripts/easy-toggle-pages.js hide <file>      # Hide file');
    console.log('  node scripts/easy-toggle-pages.js status           # Show current status');
    console.log('  node scripts/easy-toggle-pages.js deploy           # Deploy to Pages');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/easy-toggle-pages.js show package.json');
    console.log('  node scripts/easy-toggle-pages.js hide test/descriptions/overview.md');
    console.log('  node scripts/easy-toggle-pages.js deploy');
    console.log('');
    console.log('🌐 Pages URL: https://luketych.github.io/research--context_selection');
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
      
    case 'deploy':
      deployToPages();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run without arguments to see usage help');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}