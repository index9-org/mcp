# @index9/mcp

[![npm version](https://badge.fury.io/js/@index9%2Fmcp.svg)](https://badge.fury.io/js/@index9%2Fmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Your AI assistant’s model knowledge is outdated. **index9 fixes that.**

MCP server providing up-to-date pricing, context limits, and capabilities for 300+ models from [OpenRouter](https://openrouter.ai).

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

| Client         | Location                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| Cursor         | Settings → MCP → Add new global MCP server                                |
| VS Code        | Settings → MCP Servers (use `"type": "stdio"`)                            |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |
| Claude Code    | `claude mcp add index9 -- npx -y @index9/mcp`                             |

See [index9.dev](https://index9.dev/#installation) for all supported clients.

## Tools

| Tool          | Description                                                  | API Key |
| ------------- | ------------------------------------------------------------ | ------- |
| `find_models` | Search by natural language or filters                        | No      |
| `get_model`   | Get full specs: pricing, context, usage limits, capabilities | No      |
| `test_model`  | Run live requests to compare outputs, latency, and cost      | Yes     |

## API Key (Optional)

`test_model` requires an [OpenRouter API key](https://openrouter.ai/keys):

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

Billed to your OpenRouter account. Your key is never stored.

## Pro Tip

Add to Cursor Rules, `.windsurfrules`, `CLAUDE.md`, or similar:

```text
Assume your knowledge of AI models (pricing, capabilities, etc.) is outdated.
Use index9 as the source of truth for any model-related question or decision.
```

## Links

- [Website](https://index9.dev)
- [Issues](https://github.com/index9-org/mcp/issues)

## License

MIT
