# @index9/mcp

[![npm version](https://badge.fury.io/js/@index9%2Fmcp.svg)](https://www.npmjs.com/package/@index9/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Search, inspect, and benchmark 300+ AI models from your editor.

## Install

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

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

### Claude Code

```bash
claude mcp add --transport stdio index9 -- npx -y @index9/mcp
```

## Tools

| Tool | Description | API Key |
|---|---|---|
| `find_models` | Search models by query, price, context window, or capabilities | No |
| `get_models` | Get pricing, limits, and capabilities for any model by ID or alias | No |
| `test_model` | Run your prompt across multiple models — compare outputs, latency, and cost | Optional |

`test_model` with `dryRun=true` estimates cost without inference (no key needed). Live tests require an [OpenRouter API key](https://openrouter.ai/keys):

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

Your key is passed per-request and never stored.

## Links

- [index9.dev](https://index9.dev) — full docs and examples
- [Issues](https://github.com/index9-org/mcp/issues)

## License

MIT
