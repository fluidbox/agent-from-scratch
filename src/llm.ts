import { z } from 'zod'
import type { AIMessage } from '../types'
import { BEDROCK_MODELS } from './ai'
import { systemPrompt } from './systemPrompt'
import { runBedrockLLM } from './bedrockLlm'

export const runLLM = async ({
  model = BEDROCK_MODELS.CLAUDE_3_SONNET,
  messages,
  temperature = 0.1,
  tools,
}: {
  messages: AIMessage[]
  temperature?: number
  model?: string
  tools?: { name: string; parameters: z.AnyZodObject }[]
}) => {
  return runBedrockLLM({
    messages,
    temperature,
    tools,
  });
}
