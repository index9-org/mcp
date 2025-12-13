import { findModels } from "../client.js";
import type { FindModelsInput } from "../schemas.js";

export async function findModelsTool(input: FindModelsInput) {
  return findModels(input);
}
