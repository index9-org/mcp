import { searchModels } from "../client.js";
import type { SearchModelsInput } from "../schemas.js";

export async function searchModelsTool(input: SearchModelsInput) {
  const query = input.query.trim();
  if (!query) {
    throw new Error("Search query is required and must not be empty");
  }
  const result = await searchModels(query, input.limit, input.threshold);
  return { results: result.results };
}
