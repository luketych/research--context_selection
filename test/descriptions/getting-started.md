# Getting Started Guide

## Prerequisites
- Node.js 18+ installed
- Git configured
- Basic knowledge of MCP protocol

## Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd context-selection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your MCP client:
   ```bash
   cp config/mcp.example.json config/mcp.json
   # Edit config/mcp.json with your settings
   ```

## First Steps

1. Start the MCP server
2. Connect your client
3. Explore the available context files
4. Try toggling visibility of different files

## Common Issues

- **Port already in use**: Change the port in config
- **Permission denied**: Check file permissions
- **Connection refused**: Verify server is running