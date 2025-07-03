# Context Selection System - Technical Documentation

A context management system for LLMs that allows developers to selectively expose parts of their project documentation through an MCP (Model Context Protocol) server.

## Overview

This system uses Git as both a version control system and an MCP server backend, with a web interface for viewing and managing context visibility. The core concept is to give developers fine-grained control over what documentation and context their AI assistants can access.

## Architecture

### Core Components

1. **Descriptions Repository**: Git repository containing markdown files as project context documentation
2. **MCP Server Integration**: Uses gitmcp to expose the Git repository as an MCP server with selective file visibility  
3. **Visibility Control System**: Mechanism to show/hide specific files and folders from the MCP server
4. **Web Interface**: Optional web UI for managing visibility toggles

### Data Flow

```
AI Assistant → MCP Client → MCP Server (gitmcp) → Git Repository → Visible Files Only
                    ↑
            Visibility Controls
```

## Technology Stack

- **gitmcp**: Git-based MCP server implementation
- **Git**: Version control and MCP server backend
- **JavaScript/Node.js**: Scripting and automation
- **Quartz** (optional): Static site generator for web interface

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
├── config/               # MCP server configuration
├── src/                  # Application source code (if needed)
└── package.json          # Node.js dependencies and scripts
```

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- Git
- An MCP-compatible AI assistant (Claude, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd context_selection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your MCP client to connect to this server (see MCP Configuration below)

## Usage

### Starting the MCP Server

```bash
npm start
```

The server will start and be available for MCP connections.

### Managing File Visibility

```bash
# Interactive visibility toggle
npm run toggle

# List currently visible files
npm run list-visible

# Show all files
npm run show-all

# Hide all files
npm run hide-all
```

### Testing MCP Connection

```bash
npm test
```

This will verify that:
- The MCP server is running
- Files are properly exposed/hidden based on visibility settings
- Your AI assistant can connect and access visible files

## MCP Configuration

### Client Configuration

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "context_selection": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/path/to/context_selection"
    }
  }
}
```

### Server Configuration

The MCP server configuration is managed through:
- `config/mcp-server.json` - Server settings
- `.visibility` files - Per-file visibility rules
- Environment variables for advanced configuration

## Visibility Control System

### How It Works

The visibility system works by:

1. **Visibility Metadata**: Each file can have visibility metadata stored in Git attributes or separate configuration
2. **Dynamic Filtering**: The MCP server filters requests based on current visibility settings
3. **Real-time Updates**: Visibility changes are applied immediately without server restart

### Visibility States

- **Visible**: File is exposed to MCP clients
- **Hidden**: File is not accessible via MCP
- **Conditional**: File visibility based on rules (planned feature)

### Configuration Files

- `.gitattributes` - Git-based visibility rules
- `config/visibility.json` - JSON-based visibility configuration
- Per-directory `.visibility` files - Local visibility overrides

## Development

### Project Structure for Development

```
src/
├── server/               # MCP server implementation
│   ├── mcp-handler.js   # MCP protocol handling
│   ├── git-integration.js # Git repository access
│   └── visibility.js    # Visibility filtering logic
├── cli/                 # Command-line tools
│   ├── toggle.js        # Visibility toggle utility
│   └── test-connection.js # MCP connection testing
└── web/                 # Optional web interface
    ├── components/      # UI components
    └── api/            # API endpoints
```

### Adding New Features

1. **New Visibility Rules**: Extend `src/server/visibility.js`
2. **CLI Commands**: Add scripts to `src/cli/`
3. **Web Interface**: Extend `src/web/`
4. **MCP Extensions**: Modify `src/server/mcp-handler.js`

### Testing

```bash
# Run all tests
npm test

# Test MCP server
npm run test:mcp

# Test visibility system
npm run test:visibility

# Integration tests
npm run test:integration
```

## Troubleshooting

### Common Issues

1. **MCP Connection Failed**
   - Check that the server is running: `npm start`
   - Verify MCP client configuration
   - Check firewall/network settings

2. **Files Not Visible**
   - Check visibility settings: `npm run list-visible`
   - Verify file exists in `descriptions/`
   - Check Git repository status

3. **Permission Errors**
   - Ensure proper file permissions on `descriptions/`
   - Check Git repository access rights

### Debug Mode

Enable debug logging:
```bash
DEBUG=context-selection:* npm start
```

### Log Files

- `logs/mcp-server.log` - MCP server activity
- `logs/visibility.log` - Visibility change history
- `logs/error.log` - Error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

See `CONTRIBUTING.md` for detailed guidelines.

## License

[License information]

## Related Projects

- [gitmcp](https://github.com/example/gitmcp) - Git-based MCP server
- [MCP Specification](https://modelcontextprotocol.io) - Model Context Protocol documentation