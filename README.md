# @index9/mcp

Discover, shortlist, compare, cost-model, and live-test 300+ AI models from your editor

> Per-editor install configs (Cursor, VS Code, Claude Code, Codex): https://index9.dev/#install

## Install

```bash
npx -y @index9/mcp@latest
```

Generic MCP client config:

```json
{
  "mcpServers": {
    "index9": {
      "command": "npx",
      "args": ["-y", "@index9/mcp@latest"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-..."
      }
    }
  }
}
```

Claude Code one-liner: `claude mcp add --transport stdio index9 -- npx -y @index9/mcp`.

## OpenRouter API key

Required for live test_model calls. Set OPENROUTER_API_KEY in your MCP client config. dryRun=true works without it.

## Tools

- **list_facets**: List available providers, capabilities, modalities, and tokenizers
- **find_models**: Search AI models by semantic query or filters
- **get_models**: Fetch full model metadata for up to 100 IDs or aliases
- **compare_models**: Diff 2-10 models across pricing, context, capabilities, and tokenizer
- **test_model**: Run live inference or dry-run cost estimates on 1-10 models (requires OpenRouter API key)

## Response metadata

All tool responses include an `_index9` object with:

- `apiBaseUrl`: API base URL used for the request

Error responses also include:

- `status`: upstream HTTP status code
- `_index9.retryAfterSeconds`: present when `Retry-After` is returned
- `_index9.rateLimit`: present when rate-limit headers are returned (`x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`)
