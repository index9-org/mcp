import { getModel } from "../client.js";
import type { GetModelInput } from "../schemas.js";

export async function getModelTool(input: GetModelInput) {
  return getModel(input.model_id);
}
