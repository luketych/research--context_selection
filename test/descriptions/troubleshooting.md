# Troubleshooting Guide

## Common Problems

### MCP Server Issues

**Problem**: Server won't start
**Solution**: 
- Check if port is available
- Verify configuration file exists
- Check log files for errors

**Problem**: Files not visible to MCP client
**Solution**:
- Verify file visibility settings
- Restart MCP server
- Check file permissions

### Configuration Issues

**Problem**: Changes not taking effect
**Solution**:
- Restart server after configuration changes
- Clear client cache
- Verify JSON syntax in config files

### Performance Issues

**Problem**: Slow response times
**Solution**:
- Check file sizes in descriptions folder
- Monitor memory usage
- Consider implementing caching

## Debug Commands

```bash
# Check server status
curl localhost:3000/status

# List visible files
node scripts/list-visible.js

# Test MCP connection
node test-client/test-connection.js
```

## Getting Help

1. Check the logs in `logs/` directory
2. Review configuration files
3. Test with minimal setup
4. Contact support with error details