import { z } from 'zod';

/** Default description for Gemini image generation tool */
const DEFAULT_GEMINI_IMAGE_GEN_DESCRIPTION =
  `Generate high-quality, photorealistic images using Google Gemini 2.5 Flash Image model (nano-banana).

When to use \`gemini_image_gen\`:
- To create entirely new images from detailed text descriptions.
- For photorealistic image generation with natural lighting and composition.

The model excels at creating high-quality, photorealistic images from text descriptions. Provide detailed prompts about subjects, style, composition, lighting, and other visual elements.

Generated image IDs will be returned in the response for future reference.` as const;

const getGeminiImageGenDescription = () => {
  return (
    process.env.GEMINI_IMAGE_GEN_DESCRIPTION || DEFAULT_GEMINI_IMAGE_GEN_DESCRIPTION
  );
};

/** Default prompt description */
const DEFAULT_GEMINI_IMAGE_GEN_PROMPT_DESCRIPTION = `A detailed text description of the image to generate.
Be specific about subjects, style, composition, lighting, and other visual elements.
Break your idea into layers:
(1) main subject and concept,
(2) composition and positioning,
(3) lighting and mood,
(4) style and artistic direction,
(5) important details (colors, textures, features),
(6) background and environment.
Use positive, descriptive language that focuses on what should be included.` as const;

const getGeminiImageGenPromptDescription = () => {
  return (
    process.env.GEMINI_IMAGE_GEN_PROMPT_DESCRIPTION ||
    DEFAULT_GEMINI_IMAGE_GEN_PROMPT_DESCRIPTION
  );
};

export const geminiToolkit = {
  gemini_image_gen: {
    name: 'gemini_image_gen' as const,
    description: getGeminiImageGenDescription(),
    schema: z.object({
      prompt: z.string().max(32000).describe(getGeminiImageGenPromptDescription()),
      n: z
        .number()
        .int()
        .min(1)
        .max(1)
        .optional()
        .describe('Number of images to generate (currently only supports 1)'),
    }),
    responseFormat: 'content_and_artifact' as const,
  } as const,
} as const;
