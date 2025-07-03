# Context Selection System

A context management system for LLMs that allows developers to selectively expose parts of their project documentation through an MCP (Model Context Protocol) server.

## Overview

This system uses Git as both a version control system and an MCP server backend, with a web interface for viewing and managing context visibility.

## Architecture

- **Descriptions Repository**: Git repository containing markdown files as project context documentation
- **MCP Server Integration**: Uses gitmcp to expose the Git repository as an MCP server with selective file visibility
- **Visibility Control System**: Mechanism to show/hide specific files and folders from the MCP server

## Project Structure

```
/
├── descriptions/          # Markdown files serving as project context
│   ├── 0_HIGH_LEVEL_IDEA.md
│   ├── IMPLEMENTATION_PROPOSAL.md
│   ├── PROTOTYPE_README.md
│   ├── UPDATED_IMPLEMENTATION_STRATEGY.md
│   └── actionable/
│       ├── MILESTONES.md
│       └── NEXT_STEPS.md
├── scripts/              # Utility scripts for visibility management
├── test/                 # Test documentation and examples
└── package.json          # Node.js dependencies and scripts
```

## Technology Stack

- **gitmcp**: Git-based MCP server implementation
- **Git**: Version control and MCP server backend
- **JavaScript/Node.js**: Scripting and automation

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the MCP server: `npm start`
4. Use visibility toggle scripts to manage context exposure

## Scripts

- `npm start` - Start the MCP server
- `npm run toggle` - Toggle file visibility
- `npm test` - Test MCP connection

## Documentation

See the `descriptions/` folder for detailed project documentation and implementation details.