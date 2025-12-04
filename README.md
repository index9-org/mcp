# @index9/mcp

[![npm version](https://badge.fury.io/js/%40index9%2Fmcp.svg)](https://badge.fury.io/js/%40index9%2Fmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Give your AI assistant up-to-date model knowledge. 1000+ models with real-time pricing, context windows, and capabilities. Latest data, instant responses, zero cost.

## ❌ Without Index9 MCP

LLMs rely on outdated training data about AI models:

- ❌ "Use GPT-4 for complex reasoning" (missing GPT-5.1, Claude Opus 4.5, and latest models)
- ❌ "This fits in GPT-3.5's 4K context" (current models have 128K-2M+ context windows)
- ❌ Generic advice without real pricing or capability comparisons
- ❌ No awareness of cutting-edge models released this month

## ✅ With Index9 MCP

Your AI assistant has real-time access to the latest models and provides specific, data-driven recommendations:

- ✅ "Use **GPT-5.1** - 400K context, $1.25/million input, latest frontier-grade reasoning with adaptive computation"
- ✅ "For massive documents, try **Grok 4.1 Fast** with 2M context at $0.2/million input tokens"
- ✅ "Vision + reasoning needed? Use **Claude Opus 4.5** at $5/million - multimodal with 200K context"
- ✅ "Budget option: **Arcee Trinity Mini** at $0.04/million for text-only tasks"
- ✅ Compare the latest models side-by-side with current pricing, test live performance, and get cutting-edge recommendations

> *🤖 This section was written using Index9 MCP data - the AI assistant knew about Arcee Trinity Mini before it was cool!*

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

### Other MCP Clients

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

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

#### Claude Code

Run in terminal:

```bash
claude mcp add index9 -- npx -y @index9/mcp
```

#### Windsurf

Add to Windsurf MCP config file

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

#### Cline

Open Cline → MCP Servers → Edit Configuration

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
