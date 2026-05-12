# @index9/mcp

Discover, shortlist, compare, cost-model, and live-test 300+ AI models from your editor

## Install

```bash
npx -y @index9/mcp@latest
```

## OpenRouter API key

Optional: set OPENROUTER_API_KEY in your MCP client config for live test_model calls. dryRun=true works without a key.

Add the key as `OPENROUTER_API_KEY` in the MCP server environment for your client. Example:

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

**Claude Code:** Run `claude mcp add --transport stdio index9 -- npx -y @index9/mcp` or add the same config to .mcp.json / ~/.claude.json.

## Tools

- **find_models** — Search and paginate AI models by semantic query or filters
- **get_models** — Get full model metadata by IDs or aliases (batch, up to 100)
- **compare_models** — Diff 2-10 models across pricing, context, capabilities, and tokenizer
- **list_facets** — Enumerate available providers, capabilities, modalities, and tokenizers
- **test_model** — Run live inference or dry-run cost estimation across up to 10 models (requires OpenRouter API key)

## Response Metadata

All tool responses include an `_index9` object with at least:

- `apiBaseUrl` — The API base URL used for the request

Error responses also include:

- `status` — Upstream HTTP status code
- `_index9.retryAfterSeconds` — Present when `Retry-After` is returned
- `_index9.rateLimit` — Present when rate-limit headers are returned (`x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`)

