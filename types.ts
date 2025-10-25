// Define tool call type
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Define message types without relying on OpenAI imports
export type AIMessage =
  | { role: 'assistant'; content: string; tool_calls?: ToolCall[] }
  | { role: 'user'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export interface ToolFn<A = any, T = any> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>
}
