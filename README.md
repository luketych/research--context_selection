# Context Selection - Quick Start

Toggle which project documentation files are visible to AI assistants through MCP (Model Context Protocol).

## What You Can Do

- **Toggle files on/off**: Show or hide individual documentation files from AI assistants
- **Test MCP connection**: Verify that your AI assistant can access the visible files
- **Manage project context**: Control exactly what documentation your AI can see

## Commands

```bash
# Start the MCP server
npm start

# Toggle file visibility
npm run toggle

# Test MCP connection  
npm test
```

## How It Works

1. Put your project documentation in the `descriptions/` folder
2. Use `npm run toggle` to show/hide files from AI assistants
3. AI assistants connecting via MCP will only see the files you've made visible

## Files Available to Toggle

Your documentation files are in `descriptions/`:
- High-level project overview
- Implementation details
- Next steps and milestones
- Any custom documentation you add

## How to Toggle Files

### Interactive Toggle
Run the toggle command to interactively show/hide files:
```bash
npm run toggle
```

This will:
1. Show you all files in the `descriptions/` folder
2. Display current visibility status (✓ visible, ✗ hidden)  
3. Let you toggle individual files on/off
4. Update the MCP server configuration automatically

### Example Toggle Session
```
$ npm run toggle

Files in descriptions/:
✓ project-overview.md (visible)
✗ implementation-details.md (hidden)
✓ next-steps.md (visible)

Enter filename to toggle (or 'q' to quit): implementation-details.md
✓ implementation-details.md is now visible

Enter filename to toggle (or 'q' to quit): q
Configuration saved. MCP server updated.
```

### Visibility Rules
- **Visible files**: Available to AI assistants via MCP
- **Hidden files**: Stored locally but not exposed to AI
- **Changes**: Take effect immediately for new MCP connections
- **Persistence**: Visibility settings are saved between sessions

## Need More Details?

See [TECHNICAL_README.md](./TECHNICAL_README.md) for architecture details, setup instructions, and technical documentation.