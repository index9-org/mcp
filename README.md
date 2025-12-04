# @index9/mcp

[![npm version](https://badge.fury.io/js/%40index9%2Fmcp.svg)](https://badge.fury.io/js/%40index9%2Fmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Real-time model intelligence for your AI assistant. Search 1000+ models, compare pricing and capabilities, test performance—all with current data, zero cost.

## What You Get

Your AI assistant can discover, compare, and recommend models with live data:

- **Find models** by capability, price, or use case, with semantic search across 1200+ options
- **Compare side-by-side** with current pricing, context windows, and specifications
- **Get recommendations** tailored to your specific needs (coding, reasoning, vision, budget)
- **Test performance** with live API calls before committing to a model

## Quick Start

### Cursor

Open Cursor Settings → MCP → Add new global MCP server

```json
{
  "mcpServers": {
    "index9": {
      "command": "npx",
      "args": ["-y", "@index9/mcp"]
    }
  }
}
```

### VS Code

Open VS Code Settings → MCP Servers → Add Server

```json
"mcp": {
  "servers": {
    "index9": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@index9/mcp"]
    }
  }
}
```

### Other Clients

See [installation guide](https://www.index9.dev/#installation) for Claude Desktop, Claude Code, Windsurf, Cline, and 30+ other MCP clients.

## Configuration

### Testing Models (Optional)

To use the `test_model` tool, add your OpenRouter API key:

```json
{
  "mcpServers": {
    "index9": {
      "command": "npx",
      "args": ["@index9/mcp"],
      "env": {
        "OPEN_ROUTER_API_KEY": "your-key-here"
      }
    }
  }
}
```

Get your API key from [openrouter.ai/keys](https://openrouter.ai/keys).

## Available Tools

- **`list_models`** - List models with optional filters (provider, context, modality, pricing, capabilities)
- **`search_models`** - Semantic search across models using natural language
- **`get_model`** - Get complete model details and specifications
- **`compare_models`** - Compare 2-10 models side-by-side
- **`recommend_model`** - Get AI-powered model recommendations for use cases
- **`test_model`** - Run live tests against models via OpenRouter API (requires API key)

## License

MIT © [Index9](https://index9.dev)

## Related

- [Index9](https://index9.dev) - AI model registry and testing platform
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
