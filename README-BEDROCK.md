# Amazon Bedrock Integration

This project has been modified to use Amazon Bedrock instead of OpenAI for both text completion and image generation. This README explains the changes made and how to use the new implementation.

## Setup Instructions

### 1. AWS SSO Login

Before running the application, make sure you're logged in with AWS SSO:

```bash
aws sso login --profile <your-profile-name>
```

If you don't specify a profile, it will use the "default" profile.

### 2. Configuration

The `.env` file has been updated to include AWS-specific configuration:

```env
AWS_REGION="us-west-2"  # Update this to your AWS region where Bedrock is available
AWS_PROFILE="default"   # Update this to your AWS SSO profile name that has Bedrock access
```

Make sure these values match your AWS setup:

- `AWS_REGION`: The AWS region where Bedrock models are available to your account
- `AWS_PROFILE`: Your AWS SSO profile name with permissions to use Bedrock

### 3. Models Used

The implementation uses the following Bedrock models:

- **Text Generation**: Claude 3 Sonnet (`anthropic.claude-3-sonnet-20240229-v1:0`)
- **Image Generation**: Amazon Titan Image Generator (`amazon.titan-image-generator-v1`)

You can modify these in `src/bedrock.ts` if needed.

## Testing

To test the Bedrock implementation, run:

```bash
npm run test:bedrock
```

This script will:

1. Test text generation with Claude 3 Sonnet
2. Test image generation with Titan Image Generator
3. Save a generated image to `test-image.png`

## Understanding the Changes

The following changes were made to migrate from OpenAI to Amazon Bedrock:

1. Removed OpenAI package dependency
2. Created AWS Bedrock client with SSO authentication
3. Implemented Claude 3 Sonnet for text generation
4. Implemented Titan Image Generator for image generation
5. Updated types to no longer depend on OpenAI types

## Troubleshooting

### Authentication Issues

If you see errors like "Could not load credentials from any providers", ensure:

1. You're logged in with AWS SSO: `aws sso login --profile <your-profile>`
2. The `AWS_PROFILE` in `.env` matches your profile name
3. Your profile has permissions to access Bedrock models
4. The AWS region in `.env` is where Bedrock is available to your account

### Missing Models

If you get errors about models not being available, make sure:

1. You've requested access to these models in your AWS account
2. The models are available in your specified AWS region
3. Your IAM permissions allow access to these specific models
