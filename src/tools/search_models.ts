import { searchModels } from "../client.js";
import type { SearchModelsInput } from "../schemas.js";

export async function searchModelsTool(input: SearchModelsInput) {
  const result = await searchModels(input.query, input.limit, input.threshold);
  return { results: result.results };
}
