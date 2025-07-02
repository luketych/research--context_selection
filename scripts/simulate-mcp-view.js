#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VISIBILITY_FILE = path.join(__dirname, '..', '.mcp-visibility.json');

console.log('\n🔍 Simulating MCP Server View\n');
console.log('This shows what files an MCP client would see based on current visibility settings:\n');

try {
  const config = JSON.parse(fs.readFileSync(VISIBILITY_FILE, 'utf8'));
  
  console.log('Visible Files:');
  console.log('─'.repeat(60));
  
  let visibleCount = 0;
  let hiddenCount = 0;
  
  for (const [filePath, isVisible] of Object.entries(config.visibility)) {
    if (isVisible) {
      visibleCount++;
      const fullPath = path.join(__dirname, '..', filePath);
      
      try {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const firstLine = content.split('\n')[0].replace(/^#\s*/, '');
        
        console.log(`\n📄 ${filePath}`);
        console.log(`   Title: ${firstLine}`);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Modified: ${stats.mtime.toLocaleDateString()}`);
      } catch (err) {
        console.log(`\n📄 ${filePath}`);
        console.log(`   ⚠️  File not found`);
      }
    } else {
      hiddenCount++;
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log(`\nSummary: ${visibleCount} visible, ${hiddenCount} hidden`);
  
  if (hiddenCount > 0) {
    console.log('\nHidden Files (not accessible via MCP):');
    for (const [filePath, isVisible] of Object.entries(config.visibility)) {
      if (!isVisible) {
        console.log(`  ✗ ${filePath}`);
      }
    }
  }
  
} catch (error) {
  console.error('Error reading visibility configuration:', error.message);
  process.exit(1);
}

console.log('\n💡 Use "node scripts/toggle-visibility.js [file] --on/--off" to change visibility\n');