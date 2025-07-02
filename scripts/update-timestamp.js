#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates the "Updated" timestamp in a markdown file's frontmatter
 * @param {string} filePath - Path to the markdown file
 */
function updateTimestamp(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'short'
    }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2');

    // Match frontmatter pattern and update the Updated field
    const frontmatterRegex = /^---[\s\S]*?Updated: [^\n]+[\s\S]*?---/;
    
    if (frontmatterRegex.test(content)) {
      const updatedContent = content.replace(
        /(Updated: )[^\n]+/,
        `$1${timestamp}`
      );
      
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✓ Updated timestamp for ${path.basename(filePath)}`);
      return true;
    } else {
      console.warn(`⚠ No frontmatter found in ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node update-timestamp.js <file-path>');
    console.log('Example: node update-timestamp.js descriptions/IMPLEMENTATION_PROPOSAL.md');
    process.exit(1);
  }

  const filePath = args[0];
  updateTimestamp(filePath);
}

module.exports = { updateTimestamp };