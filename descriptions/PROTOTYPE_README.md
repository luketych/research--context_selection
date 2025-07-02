---
Created: 2025-07-02 16:15:00 PST
Updated: 2025-07-02 02:01:15 PM PDT
---

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
