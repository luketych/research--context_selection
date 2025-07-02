# System Architecture

## Components
1. Git Repository - stores all context files
2. MCP Server - provides access via MCP protocol
3. Visibility Controller - manages which files are exposed

## Data Flow
1. Context files are stored as .md in Git
2. Visibility configuration determines access
3. MCP clients request and receive filtered content
