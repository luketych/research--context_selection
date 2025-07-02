#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

const CONFIG_FILE = path.join(__dirname, '..', '.gitmcp', 'config.yaml');
const VISIBILITY_FILE = path.join(__dirname, '..', '.mcp-visibility.json');

/**
 * Load current visibility state from .mcp-visibility.json
 */
function loadVisibilityState() {
  try {
    return JSON.parse(fs.readFileSync(VISIBILITY_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading visibility state:', error.message);
    return null;
  }
}

/**
 * Update .gitmcp/config.yaml based on visibility state
 */
function updateGitMCPConfig(visibilityState) {
  try {
    // Load existing config or create default
    let config;
    try {
      config = yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (error) {
      config = {
        version: "1.0",
        include: [],
        exclude: [],
        settings: {
          priority_files: ["llms.txt", "README.md", "CLAUDE.md"],
          max_file_size: 1048576,
          include_metadata: true
        }
      };
    }

    // Clear current include/exclude for files we manage
    const managedPatterns = Object.keys(visibilityState.visibility);
    config.include = config.include.filter(pattern => !managedPatterns.includes(pattern));
    config.exclude = config.exclude.filter(pattern => !managedPatterns.includes(pattern));

    // Add visible files to include, hidden files to exclude
    for (const [filePath, isVisible] of Object.entries(visibilityState.visibility)) {
      if (isVisible) {
        config.include.push(filePath);
      } else {
        config.exclude.push(filePath);
      }
    }

    // Add default excludes if not present
    const defaultExcludes = [
      'node_modules/',
      '*.log',
      '.git/',
      'temp-*',
      '.mcp-visibility.json'
    ];
    
    for (const exclude of defaultExcludes) {
      if (!config.exclude.includes(exclude)) {
        config.exclude.push(exclude);
      }
    }

    // Write updated config
    const yamlContent = yaml.dump(config, { 
      defaultStyle: null,
      sortKeys: false,
      lineWidth: -1
    });
    
    fs.writeFileSync(CONFIG_FILE, yamlContent);
    console.log('✓ Updated .gitmcp/config.yaml');
    return true;

  } catch (error) {
    console.error('Error updating GitMCP config:', error.message);
    return false;
  }
}

/**
 * Check if there are uncommitted changes
 */
function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Commit and push changes to GitHub
 */
function pushChanges(commitMessage) {
  try {
    // Add the config file
    execSync('git add .gitmcp/config.yaml', { stdio: 'inherit' });
    
    // Create commit
    const message = commitMessage || 'Update MCP visibility configuration';
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    
    // Push to remote
    execSync('git push', { stdio: 'inherit' });
    
    console.log('✓ Changes pushed to GitHub');
    console.log('🔄 GitMCP.io will automatically pick up the new configuration');
    return true;

  } catch (error) {
    console.error('Error pushing changes:', error.message);
    return false;
  }
}

/**
 * Preview what will be changed
 */
function previewChanges(visibilityState) {
  console.log('\n📋 Pending Changes Preview:\n');
  
  const visible = [];
  const hidden = [];
  
  for (const [filePath, isVisible] of Object.entries(visibilityState.visibility)) {
    if (isVisible) {
      visible.push(filePath);
    } else {
      hidden.push(filePath);
    }
  }
  
  console.log('🟢 Files that will be VISIBLE via GitMCP.io:');
  visible.forEach(file => console.log(`   ✓ ${file}`));
  
  console.log('\n🔴 Files that will be HIDDEN from GitMCP.io:');
  hidden.forEach(file => console.log(`   ✗ ${file}`));
  
  console.log(`\n📊 Summary: ${visible.length} visible, ${hidden.length} hidden\n`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const commitMessage = args.find(arg => arg.startsWith('--message='))?.split('=')[1];
  const isPreview = args.includes('--preview');
  const isForce = args.includes('--force');

  console.log('🚀 Applying MCP visibility changes...\n');

  // Load current visibility state
  const visibilityState = loadVisibilityState();
  if (!visibilityState) {
    console.error('❌ Could not load visibility state');
    process.exit(1);
  }

  // Show preview
  previewChanges(visibilityState);

  if (isPreview) {
    console.log('👁️  Preview mode - no changes will be applied');
    return;
  }

  // Check for uncommitted changes
  if (!isForce && hasUncommittedChanges()) {
    console.error('❌ You have uncommitted changes. Please commit them first or use --force');
    process.exit(1);
  }

  // Update .gitmcp/config.yaml
  if (!updateGitMCPConfig(visibilityState)) {
    console.error('❌ Failed to update GitMCP configuration');
    process.exit(1);
  }

  // Push changes to GitHub
  if (!pushChanges(commitMessage)) {
    console.error('❌ Failed to push changes to GitHub');
    process.exit(1);
  }

  console.log('\n🎉 Successfully applied visibility changes!');
  console.log('💡 Your MCP clients should see the updated file list within a few minutes');
}

// Handle command line usage
if (require.main === module) {
  if (process.argv.includes('--help')) {
    console.log(`
Usage: node apply-changes.js [options]

Options:
  --preview              Show what will be changed without applying
  --message="msg"        Custom commit message  
  --force               Apply even with uncommitted changes
  --help                Show this help message

Examples:
  node apply-changes.js --preview
  node apply-changes.js --message="Enable API documentation"
  node apply-changes.js --force
`);
    process.exit(0);
  }

  main();
}

module.exports = { updateGitMCPConfig, previewChanges, pushChanges };