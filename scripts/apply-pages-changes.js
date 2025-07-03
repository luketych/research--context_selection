#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

const PAGES_CONFIG_FILE = path.join(__dirname, '..', '.gitmcp', 'pages-config.yaml');
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
 * Update GitHub Pages workflow to deploy only visible files
 */
function updatePagesWorkflow(visibilityState) {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'pages.yml');
  
  try {
    let workflow = fs.readFileSync(workflowPath, 'utf8');
    
    // Generate the file copying commands based on visibility
    const visible = [];
    const hidden = [];
    
    for (const [filePath, isVisible] of Object.entries(visibilityState.visibility)) {
      if (isVisible) {
        visible.push(filePath);
      } else {
        hidden.push(filePath);
      }
    }
    
    // Build the copy commands for visible files
    let copyCommands = [];
    
    // Add pattern-based includes
    if (visibilityState.patterns.include.length > 0) {
      for (const pattern of visibilityState.patterns.include) {
        if (pattern.includes('*.md')) {
          const dir = pattern.replace('/*.md', '').replace('*.md', '');
          if (dir && dir !== '.') {
            copyCommands.push(`
          # Copy ${pattern} if directory exists
          if [ -d "${dir}" ]; then
            mkdir -p _site/${dir}
            find ${dir} -name "*.md" -type f | while read file; do
              # Only copy if not explicitly hidden
              should_copy=true`);
            
            // Add exclusions for hidden files
            for (const hiddenFile of hidden) {
              if (hiddenFile.startsWith(dir)) {
                copyCommands.push(`              [ "$file" = "${hiddenFile}" ] && should_copy=false`);
              }
            }
            
            copyCommands.push(`              [ "$should_copy" = true ] && cp "$file" "_site/$file"
            done
          fi`);
          }
        }
      }
    }
    
    // Add explicit visible files
    for (const filePath of visible) {
      copyCommands.push(`
          # Copy explicitly visible file: ${filePath}
          if [ -f "${filePath}" ]; then
            mkdir -p "_site/$(dirname "${filePath}")"
            cp "${filePath}" "_site/${filePath}"
          fi`);
    }
    
    // Update the workflow with the new copy commands
    const updatedCopySection = copyCommands.join('\n');
    
    // Replace the copy section in the workflow
    const copyStart = workflow.indexOf('# Copy only visible files from main branch');
    const copyEnd = workflow.indexOf('# Copy important project files');
    
    if (copyStart !== -1 && copyEnd !== -1) {
      workflow = workflow.substring(0, copyStart) + 
                 `# Copy only visible files from main branch${updatedCopySection}\n          \n          ` +
                 workflow.substring(copyEnd);
    }
    
    fs.writeFileSync(workflowPath, workflow);
    console.log('✓ Updated GitHub Pages workflow');
    return true;
    
  } catch (error) {
    console.error('Error updating Pages workflow:', error.message);
    return false;
  }
}

/**
 * Update pages MCP configuration
 */
function updatePagesMCPConfig(visibilityState) {
  try {
    // Load existing pages config
    let config;
    try {
      config = yaml.load(fs.readFileSync(PAGES_CONFIG_FILE, 'utf8'));
    } catch (error) {
      console.error('Error loading pages config, using default');
      return false;
    }

    // Update include list with visible files
    const visible = [];
    for (const [filePath, isVisible] of Object.entries(visibilityState.visibility)) {
      if (isVisible) {
        visible.push(filePath);
      }
    }
    
    // Add pattern-based includes
    config.include = [...visibilityState.patterns.include, ...visible];
    
    // Remove duplicates
    config.include = [...new Set(config.include)];
    
    // Add metadata about current visibility state
    config.visibility_state = {
      last_updated: new Date().toISOString(),
      visible_files: visible.length,
      total_managed_files: Object.keys(visibilityState.visibility).length
    };

    // Write updated config
    const yamlContent = yaml.dump(config, { 
      defaultStyle: null,
      sortKeys: false,
      lineWidth: -1
    });
    
    fs.writeFileSync(PAGES_CONFIG_FILE, yamlContent);
    console.log('✓ Updated Pages MCP configuration');
    return true;

  } catch (error) {
    console.error('Error updating Pages MCP config:', error.message);
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
 * Deploy changes to GitHub and trigger Pages rebuild
 */
function deployToPages(commitMessage) {
  try {
    // Add all relevant files
    execSync('git add .github/workflows/pages.yml', { stdio: 'inherit' });
    execSync('git add .gitmcp/pages-config.yaml', { stdio: 'inherit' });
    
    // Create commit
    const message = commitMessage || 'Update GitHub Pages visibility configuration';
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    
    // Push to main branch (triggers Pages deployment)
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✓ Changes pushed to main branch');
    console.log('🚀 GitHub Pages deployment will start automatically');
    console.log('📱 Pages URL: https://luketych.github.io/research--context_selection');
    return true;

  } catch (error) {
    console.error('Error deploying to Pages:', error.message);
    return false;
  }
}

/**
 * Preview what will be deployed to Pages
 */
function previewPagesDeployment(visibilityState) {
  console.log('\n📋 GitHub Pages Deployment Preview:\n');
  
  const visible = [];
  const hidden = [];
  
  for (const [filePath, isVisible] of Object.entries(visibilityState.visibility)) {
    if (isVisible) {
      visible.push(filePath);
    } else {
      hidden.push(filePath);
    }
  }
  
  console.log('🟢 Files that will be DEPLOYED to GitHub Pages:');
  visible.forEach(file => console.log(`   ✓ ${file}`));
  
  console.log('\n🔴 Files that will be EXCLUDED from GitHub Pages:');
  hidden.forEach(file => console.log(`   ✗ ${file}`));
  
  console.log(`\n📊 Summary: ${visible.length} deployed, ${hidden.length} excluded`);
  console.log('🔒 Security: Git history will not be accessible via Pages');
  console.log('🌐 Pages URL: https://luketych.github.io/research--context_selection\n');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const commitMessage = args.find(arg => arg.startsWith('--message='))?.split('=')[1];
  const isPreview = args.includes('--preview');
  const isForce = args.includes('--force');

  console.log('🚀 Applying GitHub Pages visibility changes...\n');

  // Load current visibility state
  const visibilityState = loadVisibilityState();
  if (!visibilityState) {
    console.error('❌ Could not load visibility state');
    process.exit(1);
  }

  // Show preview
  previewPagesDeployment(visibilityState);

  if (isPreview) {
    console.log('👁️  Preview mode - no changes will be applied');
    return;
  }

  // Check for uncommitted changes
  if (!isForce && hasUncommittedChanges()) {
    console.error('❌ You have uncommitted changes. Please commit them first or use --force');
    process.exit(1);
  }

  // Update GitHub Pages workflow
  if (!updatePagesWorkflow(visibilityState)) {
    console.error('❌ Failed to update Pages workflow');
    process.exit(1);
  }

  // Update Pages MCP configuration
  if (!updatePagesMCPConfig(visibilityState)) {
    console.error('❌ Failed to update Pages MCP configuration');
    process.exit(1);
  }

  // Deploy to GitHub Pages
  if (!deployToPages(commitMessage)) {
    console.error('❌ Failed to deploy to GitHub Pages');
    process.exit(1);
  }

  console.log('\n🎉 Successfully deployed visibility changes to GitHub Pages!');
  console.log('💡 Your MCP clients can now use the Pages URL instead of direct repo access');
  console.log('🔒 Git history is no longer accessible - only current main branch content');
}

// Handle command line usage
if (require.main === module) {
  if (process.argv.includes('--help')) {
    console.log(`
Usage: node apply-pages-changes.js [options]

This script deploys visibility changes to GitHub Pages instead of using direct repository access.
GitHub Pages only serves files from the main branch, eliminating git history access.

Options:
  --preview              Show what will be deployed without applying
  --message="msg"        Custom commit message  
  --force               Deploy even with uncommitted changes
  --help                Show this help message

Examples:
  node apply-pages-changes.js --preview
  node apply-pages-changes.js --message="Deploy API documentation"
  node apply-pages-changes.js --force

Pages URL: https://luketych.github.io/research--context_selection
`);
    process.exit(0);
  }

  main();
}

module.exports = { updatePagesWorkflow, updatePagesMCPConfig, previewPagesDeployment, deployToPages };