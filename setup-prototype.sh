#!/bin/bash

# Setup script for MCP context management prototype

echo "Setting up MCP Context Management Prototype..."

# Create project structure
echo "Creating project structure..."
mkdir -p descriptions
mkdir -p scripts
mkdir -p config
mkdir -p test-client

# Create sample markdown files
echo "Creating sample context files..."
cat > descriptions/overview.md << 'EOF'
# Project Overview

This is a sample context file that provides an overview of the project.

## Key Features
- Feature 1: Context management
- Feature 2: Selective visibility
- Feature 3: MCP integration

## Architecture
The system uses Git as a backend with MCP protocol for access.
EOF

cat > descriptions/architecture.md << 'EOF'
# System Architecture

## Components
1. Git Repository - stores all context files
2. MCP Server - provides access via MCP protocol
3. Visibility Controller - manages which files are exposed

## Data Flow
1. Context files are stored as .md in Git
2. Visibility configuration determines access
3. MCP clients request and receive filtered content
EOF

cat > descriptions/api-reference.md << 'EOF'
# API Reference

## Endpoints
- `GET /context` - retrieve visible context files
- `POST /visibility` - update file visibility
- `GET /status` - check server status

## MCP Methods
- `list_files` - get list of visible files
- `read_file` - read specific file content
- `get_metadata` - get file metadata
EOF

# Create initial visibility configuration
echo "Creating visibility configuration..."
cat > .mcp-visibility.json << 'EOF'
{
  "version": "1.0",
  "visibility": {
    "descriptions/overview.md": true,
    "descriptions/architecture.md": true,
    "descriptions/api-reference.md": false
  },
  "patterns": {
    "exclude": [],
    "include": ["descriptions/*.md"]
  }
}
EOF

# Create package.json for Node.js project
echo "Initializing Node.js project..."
cat > package.json << 'EOF'
{
  "name": "context-mcp-prototype",
  "version": "0.1.0",
  "description": "MCP-based context management system prototype",
  "main": "index.js",
  "scripts": {
    "start": "node scripts/start-server.js",
    "toggle": "node scripts/toggle-visibility.js",
    "test": "node test-client/test-connection.js"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF

# Create a basic toggle script template
echo "Creating toggle visibility script..."
cat > scripts/toggle-visibility.js << 'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VISIBILITY_FILE = path.join(__dirname, '..', '.mcp-visibility.json');

function loadVisibility() {
  try {
    return JSON.parse(fs.readFileSync(VISIBILITY_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading visibility config:', error);
    process.exit(1);
  }
}

function saveVisibility(config) {
  fs.writeFileSync(VISIBILITY_FILE, JSON.stringify(config, null, 2));
}

function toggleFile(filePath, state) {
  const config = loadVisibility();
  
  if (state === 'on') {
    config.visibility[filePath] = true;
  } else if (state === 'off') {
    config.visibility[filePath] = false;
  } else {
    config.visibility[filePath] = !config.visibility[filePath];
  }
  
  saveVisibility(config);
  console.log(`File ${filePath} is now ${config.visibility[filePath] ? 'visible' : 'hidden'}`);
}

function listVisibility() {
  const config = loadVisibility();
  console.log('\nFile Visibility Status:');
  console.log('─'.repeat(50));
  
  for (const [file, visible] of Object.entries(config.visibility)) {
    const status = visible ? '✓ visible' : '✗ hidden';
    console.log(`${status.padEnd(12)} ${file}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--list') {
  listVisibility();
} else {
  const filePath = args[0];
  const state = args[1]?.replace('--', '');
  toggleFile(filePath, state);
}
EOF

# Make scripts executable
chmod +x scripts/toggle-visibility.js
chmod +x setup-prototype.sh

# Create a README for the prototype
cat > PROTOTYPE_README.md << 'EOF'
# MCP Context Management Prototype

## Quick Start

1. Install gitmcp (once available):
   ```bash
   npm install -g gitmcp  # or appropriate installation method
   ```

2. Start the MCP server:
   ```bash
   gitmcp serve .  # or appropriate command
   ```

3. Toggle file visibility:
   ```bash
   node scripts/toggle-visibility.js descriptions/api-reference.md --on
   node scripts/toggle-visibility.js descriptions/architecture.md --off
   node scripts/toggle-visibility.js --list
   ```

4. Test MCP connection:
   - Configure your MCP client to connect to the server
   - Verify that only visible files appear in the context

## Current Status

- [x] Basic project structure created
- [x] Sample context files added
- [x] Visibility configuration schema defined
- [x] Toggle script implemented
- [ ] gitmcp integration pending
- [ ] MCP server wrapper pending
- [ ] Client testing pending

## Next Steps

1. Research gitmcp installation and configuration
2. Test basic MCP connectivity
3. Implement filtering mechanism
4. Validate with MCP clients
EOF

echo "Setup complete! Check PROTOTYPE_README.md for next steps."
EOF

chmod +x setup-prototype.sh