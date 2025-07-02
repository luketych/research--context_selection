#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_FILE = path.join(__dirname, '..', '.gitmcp', 'config.yaml');
const VISIBILITY_FILE = path.join(__dirname, '..', '.mcp-visibility.json');

/**
 * Load GitMCP configuration
 */
function loadGitMCPConfig() {
  try {
    return yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Load local visibility state
 */
function loadVisibilityState() {
  try {
    return JSON.parse(fs.readFileSync(VISIBILITY_FILE, 'utf8'));
  } catch (error) {
    return null;
  }
}

/**
 * Check if local state matches GitMCP config
 */
function compareStates(localState, gitMCPConfig) {
  if (!localState || !gitMCPConfig) return false;

  const localFiles = Object.keys(localState.visibility);
  const gitMCPIncluded = gitMCPConfig.include || [];
  const gitMCPExcluded = gitMCPConfig.exclude || [];

  // Check if all locally visible files are in GitMCP include
  for (const [filePath, isVisible] of Object.entries(localState.visibility)) {
    const inGitMCPInclude = gitMCPIncluded.includes(filePath);
    const inGitMCPExclude = gitMCPExcluded.includes(filePath);

    if (isVisible && !inGitMCPInclude) return false;
    if (!isVisible && !inGitMCPExclude) return false;
  }

  return true;
}

/**
 * Get repository information
 */
function getRepoInfo() {
  try {
    const { execSync } = require('child_process');
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    // Parse GitHub URL
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        branch,
        gitMCPUrl: `https://gitmcp.io/${match[1]}/${match[2]}`
      };
    }
  } catch (error) {
    // Fallback for non-git repos
  }
  
  return null;
}

/**
 * Main status display
 */
function displayStatus() {
  console.log('📊 MCP Configuration Status\n');

  // Repository info
  const repoInfo = getRepoInfo();
  if (repoInfo) {
    console.log('🔗 Repository Information:');
    console.log(`   Repository: ${repoInfo.owner}/${repoInfo.repo}`);
    console.log(`   Branch: ${repoInfo.branch}`);
    console.log(`   GitMCP URL: ${repoInfo.gitMCPUrl}`);
    console.log('');
  }

  // Load configurations
  const localState = loadVisibilityState();
  const gitMCPConfig = loadGitMCPConfig();

  // Local state status
  console.log('📋 Local Visibility State:');
  if (localState) {
    const visible = Object.entries(localState.visibility).filter(([_, v]) => v).length;
    const hidden = Object.entries(localState.visibility).filter(([_, v]) => !v).length;
    console.log(`   ✓ Loaded: ${visible} visible, ${hidden} hidden files`);
  } else {
    console.log('   ❌ Not found or invalid');
  }

  // GitMCP config status
  console.log('\n⚙️  GitMCP Configuration:');
  if (gitMCPConfig) {
    const included = (gitMCPConfig.include || []).length;
    const excluded = (gitMCPConfig.exclude || []).length;
    console.log(`   ✓ Loaded: ${included} included, ${excluded} excluded patterns`);
    console.log(`   Version: ${gitMCPConfig.version || 'not specified'}`);
  } else {
    console.log('   ❌ Not found or invalid');
  }

  // Sync status
  console.log('\n🔄 Synchronization Status:');
  if (localState && gitMCPConfig) {
    const inSync = compareStates(localState, gitMCPConfig);
    if (inSync) {
      console.log('   ✅ Local state matches GitMCP configuration');
    } else {
      console.log('   ⚠️  Local state differs from GitMCP configuration');
      console.log('   💡 Run "node scripts/apply-changes.js" to sync');
    }
  } else {
    console.log('   ❓ Cannot determine sync status (missing configurations)');
  }

  // Git status
  console.log('\n📝 Git Status:');
  try {
    const { execSync } = require('child_process');
    const status = execSync('git status --porcelain .gitmcp/config.yaml', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('   📝 .gitmcp/config.yaml has uncommitted changes');
    } else {
      console.log('   ✅ .gitmcp/config.yaml is up to date');
    }
  } catch (error) {
    console.log('   ❓ Cannot determine git status');
  }

  // Quick actions
  console.log('\n🔧 Quick Actions:');
  console.log('   • Toggle file: node scripts/toggle-visibility.js <file> --on/--off');
  console.log('   • Preview changes: node scripts/apply-changes.js --preview');
  console.log('   • Apply changes: node scripts/apply-changes.js');
  console.log('   • Simulate MCP view: node scripts/simulate-mcp-view.js');

  if (repoInfo) {
    console.log(`\n🌐 Test your MCP server at: ${repoInfo.gitMCPUrl}`);
  }
}

// Command line execution
if (require.main === module) {
  displayStatus();
}

module.exports = { loadGitMCPConfig, loadVisibilityState, compareStates, getRepoInfo };