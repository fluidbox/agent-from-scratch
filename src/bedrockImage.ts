import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { bedrockClient, BEDROCK_MODELS } from "./bedrock";
import { mockTitanImageResponse } from "./bedrockMocks";

interface TitanImageGenerationInput {
   taskType: string;
   textToImageParams: {
      text: string;
      negativeText?: string;
   };
   imageGenerationConfig: {
      numberOfImages: number;
      height: number;
      width: number;
      cfgScale?: number;
      seed?: number;
   };
}

interface TitanImageGenerationOutput {
   images: string[];
   error?: string;
}

/**
 * Generate an image using Amazon Bedrock Titan Image Generator model
 */
export const generateImageWithBedrock = async (prompt: string): Promise<string> => {
   try {
      // Create input payload for Titan Image Generator
      const input: TitanImageGenerationInput = {
         taskType: "TEXT_IMAGE",
         textToImageParams: {
            text: prompt,
         },
         imageGenerationConfig: {
            numberOfImages: 1,
            height: 1024,
            width: 1024,
            cfgScale: 8.0,
         },
      };

      // Create the command
      const command = new InvokeModelCommand({
         modelId: BEDROCK_MODELS.TITAN_IMAGE_GENERATOR,
         body: JSON.stringify(input),
         contentType: "application/json",
         accept: "application/json",
      });

      // Send the request to Bedrock
      const response = await bedrockClient.send(command);

      // Parse the response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as TitanImageGenerationOutput;

      if (responseBody.error) {
         throw new Error(`Bedrock image generation error: ${responseBody.error}`);
      }

      if (!responseBody.images || responseBody.images.length === 0) {
         throw new Error("No images were generated");
      }

      // Return the base64 image - client code will need to handle this format
      return responseBody.images[0];
   } catch (error) {
      console.error("Error generating image with Bedrock:", error);

      // Use mock image response instead of failing
      // This allows the app to function for demo purposes when AWS credentials aren't available
      console.log("Using mock image response since Bedrock call failed");
      return mockTitanImageResponse(prompt);
   }
};
