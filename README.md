# @index9/mcp

[![npm version](https://badge.fury.io/js/@index9%2Fmcp.svg)](https://badge.fury.io/js/@index9%2Fmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Install](#quick-start) • [Issues](https://github.com/index9-org/mcp/issues)

MCP server for searching and testing AI models. Data from [OpenRouter](https://openrouter.ai).

## Quick Start

**Zero Config:** Search and Lookup features work immediately after installation. No API keys required.

### Cursor

Open **Cursor Settings** → **MCP**

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=index9&config=eyJjb21tYW5kIjoibnB4IC15IEBpbmRleDkvbWNwIn0%3D)

### VS Code

Add to your **MCP Servers** settings:

```json
{
  "mcp": {
    "servers": {
      "index9": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@index9/mcp"]
      }
    }
  }
}
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

See [index9.dev](https://index9.dev/#installation) for Windsurf, Cline, and other clients.

## Configuration (Optional)

The **find_models** and **get_model** tools are free and require no configuration.

To use the **test_model** tool (for running live API calls), you must provide an OpenRouter API key.

```json
{
  "mcpServers": {
    "index9": {
      "command": "npx",
      "args": ["-y", "@index9/mcp"],
      "env": {
        "OPENROUTER_API_KEY": "sk-..."
      }
    }
  }
}
```

_Your key is never stored. It is only used to make ephemeral requests to OpenRouter for testing purposes._

## Tools

| Tool          | Description                                                                                                                          | Config Required      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `find_models` | Search and filter 300+ AI models. Use natural language ("fast coding model") or strict filters for price, context, and capabilities. | None                 |
| `get_model`   | Get complete technical specifications. Returns pricing, context windows, max output tokens, and capabilities for any model.          | None                 |
| `test_model`  | Run live performance tests. Execute real API calls to multiple models simultaneously to compare latency, token usage, and costs.     | `OPENROUTER_API_KEY` |

## Usage Examples

Ask your AI assistant natural questions to find models:

- "Find a cheap vision model with at least 128k context"
- "What are the best models for coding under $1 per million tokens?"
- "Compare the specs of gpt-4o and claude-3-5-sonnet"
- "Test the latency of haiku vs gemini-flash with a simple 'hello world' prompt"

## License

MIT © [Index9](https://index9.dev)
