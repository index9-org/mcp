import { testModel } from "../client.js";
import { OPEN_ROUTER_API_KEY } from "../config.js";
import type { TestModelInput } from "../schemas.js";

export async function testModelTool(input: TestModelInput) {
  return testModel(
    input.model_ids,
    input.test_type,
    OPEN_ROUTER_API_KEY,
    input.prompt,
    input.max_tokens,
  );
}
