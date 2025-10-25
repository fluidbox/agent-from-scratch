import type { ToolFn } from '../../types'
import { z } from 'zod'
import { generateImageWithBedrock } from '../bedrockImage'
import fs from 'fs'
import path from 'path'

export const generateImageToolDefinition = {
  name: 'generate_image',
  parameters: z
    .object({
      prompt: z
        .string()
        .describe(
          'The prompt to use to generate the image with a diffusion model image generator like Titan Image Generator'
        ),
    })
    .describe('Generates an image and returns the url of the image.'),
}

type Args = z.infer<typeof generateImageToolDefinition.parameters>

export const generateImage: ToolFn<Args, string> = async ({
  toolArgs,
  userMessage,
}) => {
  try {
    // Use direct Bedrock client for image generation
    const imageBase64 = await generateImageWithBedrock(toolArgs.prompt);

    // Save the image to a file for viewing
    const imgBuffer = Buffer.from(imageBase64, 'base64');
    const outputPath = path.join(process.cwd(), 'generated-image.png');
    fs.writeFileSync(outputPath, imgBuffer as any);

    // Return a shorter message instead of the large base64 data
    return `Image generated successfully and saved to ${outputPath}. The image shows: ${toolArgs.prompt}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
