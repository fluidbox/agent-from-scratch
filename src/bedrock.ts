import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { fromEnv, fromIni } from "@aws-sdk/credential-providers";

// For demo purposes, let's use a fallback credential approach
// that doesn't strictly require AWS SSO to be set up
const getCredentials = () => {
   try {
      // First try to use AWS profile if specified in .env
      if (process.env.AWS_PROFILE) {
         return fromIni({
            profile: process.env.AWS_PROFILE
         });
      }

      // Otherwise, fall back to environment credentials (AWS_ACCESS_KEY_ID, etc.)
      return fromEnv();
   } catch (error) {
      console.warn("Using empty credentials for demo purposes. In a real application, you would need proper AWS credentials.");
      // For demo purposes, return empty credentials that will work for local mock/demo
      return {
         accessKeyId: "mock-access-key-id",
         secretAccessKey: "mock-secret-access-key"
      };
   }
};

// Initialize the Bedrock client with more forgiving credential options for demo
export const bedrockClient = new BedrockRuntimeClient({
   region: process.env.AWS_REGION || 'us-west-2',
   credentials: getCredentials()
});

// Model IDs for Bedrock
export const BEDROCK_MODELS = {
   CLAUDE_3_SONNET: "anthropic.claude-3-sonnet-20240229-v1:0",
   TITAN_IMAGE_GENERATOR: "amazon.titan-image-generator-v1",
};
