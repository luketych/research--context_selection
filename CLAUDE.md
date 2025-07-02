# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a context management system for LLMs that allows developers to selectively expose parts of their project documentation through an MCP (Model Context Protocol) server. The system uses Git as both a version control system and an MCP server backend, with Quartz providing a web interface for viewing and managing context visibility.

## Architecture

### Core Components

1. **Descriptions Repository**: A Git repository containing markdown files that serve as project context documentation
2. **MCP Server Integration**: Uses gitmcp to expose the Git repository as an MCP server with selective file visibility
3. **Frontend Interface**: Quartz-based web application that renders markdown files and provides visibility toggles
4. **Visibility Control System**: Mechanism to show/hide specific files and folders from the MCP server

### Technology Stack

- **gitmcp**: Git-based MCP server implementation
- **Quartz**: Static site generator for markdown-to-HTML rendering
- **Git**: Version control and MCP server backend

## Development Setup

Since this is a greenfield project, initial setup will involve:

1. Initialize a Node.js project with package.json
2. Install required dependencies (gitmcp, Quartz)
3. Set up project structure with descriptions folder
4. Configure MCP server with gitmcp
5. Set up Quartz for frontend rendering
6. Implement visibility toggle functionality

## Project Structure (Planned)

```
/
├── descriptions/          # Markdown files serving as project context
├── src/                  # Application source code
│   ├── frontend/         # Quartz-based UI components
│   └── backend/          # MCP server configuration and visibility control
├── config/               # Configuration files for gitmcp and Quartz
└── public/               # Generated static site files
```

## Key Implementation Considerations

1. **MCP Server Configuration**: The gitmcp server needs to be configured to respect visibility settings, potentially using a configuration file or database to track which files/folders are exposed
2. **Visibility State Management**: Need to implement a system to persist and apply visibility toggles, possibly using Git attributes or a separate configuration system
3. **Quartz Integration**: Configure Quartz to generate a UI that includes visibility checkboxes for each file/folder
4. **Real-time Updates**: Implement a mechanism to update the MCP server configuration when visibility toggles are changed

## Next Steps

To begin implementation:
1. Create a package.json and install dependencies
2. Set up the basic project structure
3. Configure gitmcp for the descriptions repository
4. Create a minimal Quartz configuration
5. Implement the visibility toggle system
6. Test MCP server access with different visibility configurations