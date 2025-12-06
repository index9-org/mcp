# @index9/mcp

[![npm version](https://badge.fury.io/js/@index9%2Fmcp.svg)](https://badge.fury.io/js/@index9%2Fmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[📦 **Install**](#quick-start) • [🐛 **Issues**](https://github.com/index9-org/mcp/issues)

Real-time model intelligence for your AI assistant. Search 1200+ models, compare pricing and capabilities, test performance—all with current data, zero cost.

## What You Get

Your AI assistant gets live model intelligence for smarter recommendations:

- **Search models** by capability, price, or modality across 1200+ options instantly
- **Compare models** side-by-side with current pricing and context windows
- **Get recommendations** tailored to your use case, budget, and requirements
- **Test models** with real API calls to see latency and behavior before you commit

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

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=index9&config=eyJjb21tYW5kIjoibnB4IC15IEBpbmRleDkvbWNwIn0%3D)

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

To enable live model testing, add your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys) to your MCP config. Charges go directly to your OpenRouter account.

## Available Tools

- **`list_models`** - Filter models by provider, context, pricing, capabilities, and modality
- **`search_models`** - Natural language search across all models
- **`get_model`** - Get complete model specs and details
- **`compare_models`** - Side-by-side comparison of up to 10 models
- **`recommend_model`** - AI-powered recommendations for your use case
- **`test_model`** - Live API testing with latency and cost estimates (requires API key)

## Data Sources

Data sourced from [OpenRouter](https://openrouter.ai) and [models.dev](https://models.dev).

## License

MIT © [Index9](https://index9.dev)
