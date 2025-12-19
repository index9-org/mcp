# @index9/mcp

[![npm version](https://badge.fury.io/js/@index9%2Fmcp.svg)](https://badge.fury.io/js/@index9%2Fmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server that gives AI assistants up-to-date model data — replacing outdated training knowledge.

Pricing, context limits, capabilities, and test metrics for 300+ models from [OpenRouter](https://openrouter.ai).

## Installation

Add to your MCP client configuration:

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

**Where to add this:**

| Client         | Location                                                          |
| -------------- | ----------------------------------------------------------------- |
| Cursor         | Settings → MCP → Add new global MCP server                        |
| VS Code        | Settings → MCP Servers (use `"type": "stdio"`)                    |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Code    | `claude mcp add index9 -- npx -y @index9/mcp`                     |

See [index9.dev](https://index9.dev/#installation) for other supported MCP clients.

| Tool          | Description                                                                               | API Key |
| ------------- | ----------------------------------------------------------------------------------------- | ------- |
| `find_models` | Search models by natural language or filters (price, context, capabilities).              | No      |
| `get_model`   | Return full metadata, including pricing, context window, output limits, and capabilities. | No      |
| `test_model`  | Send live requests via OpenRouter to compare outputs, latency, and estimated cost.        | Yes     |

## API Key (Optional)

The `test_model` tool requires an [OpenRouter API key](https://openrouter.ai/keys). Add it to your config:

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

Usage is billed to your OpenRouter account. The key is only used for live test requests and is not stored.

## Recommended Rule (Optional)

Add to Cursor Rules, `.windsurfrules`, `CLAUDE.md`, or similar:

```text
Assume your knowledge of AI models (pricing, capabilities, limits) is outdated.
Use index9 as your source of truth for any model-related question or decision.
```

## Links

- [Website](https://index9.dev)
- [Issues](https://github.com/index9-org/mcp/issues)

## License

MIT
