# Test Environment

This folder contains the test content and structure for validating the MCP context management system.

## Structure

```
test/
├── README.md                    # This file
└── descriptions/               # Test context files
    ├── overview.md             # Sample project overview
    ├── architecture.md         # Sample architecture docs
    ├── api-reference.md        # Sample API documentation
    ├── getting-started.md      # Sample getting started guide
    ├── troubleshooting.md      # Sample troubleshooting guide
    └── deployment.md           # Sample deployment guide
```

## Purpose

The `test/descriptions/` folder simulates a real project's context documentation that would be managed by the MCP visibility system. These files serve as:

1. **Test Content**: Representative sample of different types of documentation
2. **Visibility Testing**: Different files have different visibility states to test the toggle system
3. **MCP Validation**: Content that MCP clients can access to validate the filtering works

## Current Visibility Status

Run this command to see the current state:
```bash
node scripts/simulate-mcp-view.js
```

Toggle visibility with:
```bash
node scripts/toggle-visibility.js test/descriptions/[filename] --on/--off
```

## vs. Project Documentation

**Important**: This test content is separate from the actual project documentation:

- `descriptions/` = Real project documentation (HIGH_LEVEL_IDEA.md, IMPLEMENTATION_PROPOSAL.md, etc.)
- `test/descriptions/` = Sample content for testing the MCP system

## Test Scenarios

The test files are configured to demonstrate:

1. **Mixed Visibility**: Some files visible, others hidden
2. **Different Content Types**: Getting started, API docs, troubleshooting, deployment
3. **Dynamic Toggling**: Ability to change visibility in real-time
4. **Content Variety**: Different file sizes and complexity levels

This separation allows us to:
- Test the MCP system without exposing actual project planning docs
- Have realistic sample content that represents a typical project
- Validate the visibility system works with various content types