import { compareModels } from "../client.js";
import type { CompareModelsInput } from "../schemas.js";

export async function compareModelsTool(input: CompareModelsInput) {
  return compareModels(input.model_ids);
}
