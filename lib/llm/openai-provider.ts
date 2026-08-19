import { LLMMessage, LLMProvider } from "@/types";

export class OpenAIProvider implements LLMProvider {
  public name = "OpenAI Compatible LLM";
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey?: string, model?: string, baseURL?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.model = model || process.env.LLM_MODEL || "gpt-4o";
    this.baseURL = baseURL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  }

  public async generateText(messages: LLMMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  public async generateJSON<T>(messages: LLMMessage[], schemaDescription?: string): Promise<T> {
    const systemInstruction: LLMMessage = {
      role: "system",
      content: `Respond ONLY with valid, parseable JSON matching this schema/intent: ${
        schemaDescription || "JSON Object"
      }. Do NOT include markdown code blocks, backticks, or preamble.`,
    };

    const combinedMessages = [systemInstruction, ...messages];
    const text = await this.generateText(combinedMessages);

    try {
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(cleaned) as T;
    } catch (e: any) {
      throw new Error(`Failed to parse LLM JSON output: ${text}`);
    }
  }
}
