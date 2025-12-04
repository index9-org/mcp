import { listModels } from "../client.js";
import type { ListModelsQueryParams } from "../types/index.js";
import type { ListModelsInput } from "../schemas.js";

export async function listModelsTool(input: ListModelsInput) {
  const result = await listModels(input as ListModelsQueryParams);
  return {
    models: result.models.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      context_window: m.context_window,
      max_output_tokens: m.max_output_tokens,
      input_modalities: m.input_modalities,
      pricing: {
        input: m.pricing.input,
        output: m.pricing.output,
      },
      capabilities: {
        vision: m.capabilities.vision,
        audio: m.capabilities.audio,
        tool_calling: m.capabilities.tool_calling,
        json_mode: m.capabilities.json_mode,
      },
      architecture: m.architecture,
    })),
  };
}
