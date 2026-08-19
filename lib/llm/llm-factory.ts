import { LLMProvider } from "@/types";
import { MockLLMProvider, mockLLMProvider } from "./mock-llm-provider";
import { OpenAIProvider } from "./openai-provider";

export function getLLMProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "mock").toLowerCase();

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }

  return mockLLMProvider;
}
