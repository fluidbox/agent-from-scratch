/**
 * Mock implementations for Bedrock services
 * These are used when AWS credentials are not available
 */

// Mock Claude response for text generation
export const mockClaudeTextResponse = (prompt: string) => {
   console.log('Using mock Claude response for text generation');

   // For a dad joke request, provide a mock joke
   if (prompt.toLowerCase().includes('dad joke') || prompt.toLowerCase().includes('joke')) {
      return {
         role: "assistant",
         content: "I'd tell you a joke about paper, but it's tearable.",
      };
   }

   // Default response
   return {
      role: "assistant",
      content: "I'm a mock Claude response. In a production environment, this would be a real response from Claude 3 Sonnet on AWS Bedrock. Your prompt was: " + prompt,
   };
};

// Mock Titan image response for image generation
export const mockTitanImageResponse = (prompt: string) => {
   console.log('Using mock Titan Image Generator response');

   // Return a base64 placeholder image that says "Mock Image"
   // This is a tiny transparent PNG that would normally be replaced with a real image from Titan
   return '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';
};
