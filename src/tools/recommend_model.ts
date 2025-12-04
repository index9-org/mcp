import { recommendModel } from "../client.js";
import type { RecommendModelInput } from "../schemas.js";

export async function recommendModelTool(input: RecommendModelInput) {
  return recommendModel(
    input.use_case,
    input.max_price_per_m,
    input.min_context,
    input.required_capabilities,
    input.limit,
  );
}
