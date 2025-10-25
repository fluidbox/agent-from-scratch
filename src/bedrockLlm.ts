import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { AIMessage, ToolCall } from '../types';
import { bedrockClient, BEDROCK_MODELS } from './bedrock';
import { systemPrompt } from './systemPrompt';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { mockClaudeTextResponse } from './bedrockMocks';

// Define types for Claude messages
interface ClaudeMessageInput {
   anthropic_version: string;
   max_tokens: number;
   system: string;
   messages: any[];
   temperature?: number;
   tools?: any[];
}

// Format messages for Claude 3 (Anthropic) message format
const formatClaudeMessages = (messages: AIMessage[], systemPromptText: string): ClaudeMessageInput => {
   return {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: systemPromptText,
      messages: messages.map((msg) => {
         if (msg.role === 'assistant' && 'tool_calls' in msg) {
            // Handle tool calls in assistant messages - Claude format uses content array
            const content = [];
            if (msg.content) {
               content.push({ type: 'text', text: msg.content });
            }
            if (msg.tool_calls) {
               msg.tool_calls.forEach(toolCall => {
                  content.push({
                     type: 'tool_use',
                     id: toolCall.id,
                     name: toolCall.function.name,
                     input: toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {}
                  });
               });
            }
            return {
               role: 'assistant',
               content: content
            };
         }

         if (msg.role === 'tool') {
            // Handle tool results - Claude format
            return {
               role: 'user',
               content: [{
                  type: 'tool_result',
                  tool_use_id: msg.tool_call_id,
                  content: msg.content || ""
               }]
            };
         }

         return {
            role: msg.role,
            content: msg.content || ""
         };
      })
   };
};

// Format tools for Bedrock API
const formatToolsForBedrock = (tools?: { name: string; parameters: any }[]) => {
   if (!tools) return undefined;

   return tools.map(tool => {
      // Convert Zod schema to JSON schema for Bedrock
      const jsonSchema = zodToJsonSchema(tool.parameters) as any;
      
      return {
         name: tool.name,
         description: jsonSchema.description || `Tool: ${tool.name}`,
         input_schema: {
            type: "object",
            properties: jsonSchema.properties || {},
            required: jsonSchema.required || []
         }
      };
   });
};

// Format Claude response to the expected format for our application
const formatClaudeResponse = (claudeResponse: any, toolsWereProvided: boolean): AIMessage => {
   const content = claudeResponse.content || [];

   // Extract the text and tool calls from Claude's response
   let textContent = "";
   let toolCalls: ToolCall[] = [];

   for (const item of content) {
      if (item.type === 'text') {
         textContent += item.text;
      } else if (item.type === 'tool_use') {
         toolCalls.push({
            id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: "function" as const,
            function: {
               name: item.name,
               arguments: JSON.stringify(item.input || {})
            }
         });
      }
   }

   // Return in our standardized format
   return {
      role: "assistant" as const,
      content: textContent,
      ...(toolsWereProvided && toolCalls.length > 0 ? { tool_calls: toolCalls } : {})
   };
};

export const runBedrockLLM = async ({
   messages,
   temperature = 0.1,
   tools,
}: {
   messages: AIMessage[];
   temperature?: number;
   tools?: { name: string; parameters: any }[];
}) => {
   try {
      // Trim conversation to last 10 messages to avoid context length issues
      const trimmedMessages = messages.slice(-10);

      // Get the user's latest message for mock response context
      const userMessage = trimmedMessages.filter(msg => msg.role === 'user')
         .slice(-1)[0]?.content || '';

      // Format the input for Claude 3
      const claudeInput = formatClaudeMessages(trimmedMessages, systemPrompt);

      // Add tools if provided
      const bedrockTools = tools ? formatToolsForBedrock(tools) : undefined;
      if (bedrockTools) {
         claudeInput.tools = bedrockTools;
      }

      // Set temperature
      claudeInput.temperature = temperature;

      // Create the command
      const command = new InvokeModelCommand({
         modelId: BEDROCK_MODELS.CLAUDE_3_SONNET,
         body: JSON.stringify(claudeInput),
         contentType: "application/json",
         accept: "application/json",
      });

      // Send the request to Bedrock
      const response = await bedrockClient.send(command);

      // Parse the response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Format the response for our application
      return formatClaudeResponse(responseBody, !!tools);
   } catch (error) {
      console.error("Error calling Bedrock:", error);

      // Use mock response instead of failing
      // This allows the app to function for demo purposes when AWS credentials aren't available
      console.log("Using mock response since Bedrock call failed");

      // Get the user's latest message for context
      const userMessage = messages.filter(msg => msg.role === 'user')
         .slice(-1)[0]?.content || '';

      return mockClaudeTextResponse(userMessage);
   }
};
