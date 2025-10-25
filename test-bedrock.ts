import 'dotenv/config';
import { runLLM } from './src/llm';
import { BEDROCK_MODELS } from './src/ai';
import { generateImageWithBedrock } from './src/bedrockImage';
import * as fs from 'fs';
import * as path from 'path';

const testLLMWithBedrock = async () => {
   console.log('Testing LLM with Bedrock Claude 3 Sonnet...');

   try {
      const response = await runLLM({
         model: BEDROCK_MODELS.CLAUDE_3_SONNET,
         messages: [
            {
               role: 'user',
               content: 'Write a short poem about clouds in 4 lines.'
            }
         ],
         temperature: 0.7
      });

      console.log('Claude 3 Sonnet Response:');
      console.log(response.content);
      console.log('\n');

      return true;
   } catch (error) {
      console.error('Error testing LLM with Bedrock:', error);
      return false;
   }
};

const testImageGenerationWithBedrock = async () => {
   console.log('Testing Image Generation with Bedrock Titan Image Generator...');

   try {
      const prompt = 'A beautiful mountain landscape with clouds and a lake, digital art style';
      const base64Image = await generateImageWithBedrock(prompt);

      // Save the image to a file for verification
      const imgBuffer = Buffer.from(base64Image, 'base64');
      const outputPath = path.join(process.cwd(), 'test-image.png');
      fs.writeFileSync(outputPath, imgBuffer);

      console.log(`Image generated and saved to ${outputPath}`);
      console.log('\n');

      return true;
   } catch (error) {
      console.error('Error testing image generation with Bedrock:', error);
      return false;
   }
};

const runTests = async () => {
   console.log('Starting Bedrock integration tests...\n');

   const llmSuccess = await testLLMWithBedrock();
   const imageSuccess = await testImageGenerationWithBedrock();

   console.log('Test Results:');
   console.log(`LLM Test: ${llmSuccess ? 'SUCCESS' : 'FAILED'}`);
   console.log(`Image Generation Test: ${imageSuccess ? 'SUCCESS' : 'FAILED'}`);

   if (llmSuccess && imageSuccess) {
      console.log('\nAll tests passed! The Bedrock integration is working correctly.');
   } else {
      console.log('\nSome tests failed. Please check the logs above for more information.');
   }
};

runTests();
