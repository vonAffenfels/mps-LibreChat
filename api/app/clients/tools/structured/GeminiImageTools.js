const { v4 } = require('uuid');
const { tool } = require('@langchain/core/tools');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('@librechat/data-schemas');
const { logAxiosError } = require('@librechat/api');
const { ContentTypes } = require('librechat-data-provider');

const displayMessage =
  "The tool displayed an image. All generated images are already plainly visible, so don't repeat the descriptions in detail. Do not list download links as they are available in the UI already. The user may download the images by clicking on them, but do not mention anything about downloading to the user.";

/**
 * Replaces unwanted characters from the input string
 * @param {string} inputString - The input string to process
 * @returns {string} - The processed string
 */
function replaceUnwantedChars(inputString) {
  return inputString
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/"/g, '')
    .trim();
}

function returnValue(value) {
  if (typeof value === 'string') {
    return [value, {}];
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value;
    }
    return [displayMessage, value];
  }
  return value;
}

function createAbortHandler() {
  return function () {
    logger.debug('[GeminiImageGen] Image generation aborted');
  };
}

/**
 * Creates Gemini Image generation tool
 * @param {Object} fields - Configuration fields
 * @param {ServerRequest} fields.req - The request object
 * @param {boolean} fields.isAgent - Whether the tool is being used in an agent context
 * @param {string} fields.IMAGE_GEN_GEMINI_API_KEY - The Gemini API key
 * @param {boolean} [fields.override] - Whether to override the API key check
 * @returns {Array<ReturnType<tool>>} - Array with the image generation tool
 */
function createGeminiImageTools(fields = {}) {
  /** @type {boolean} Used to initialize the Tool without necessary variables. */
  const override = fields.override ?? false;
  /** @type {boolean} */
  if (!override && !fields.isAgent) {
    throw new Error('This tool is only available for agents.');
  }

  const getApiKey = () => {
    const apiKey = process.env.IMAGE_GEN_GEMINI_API_KEY ?? '';
    if (!apiKey && !override) {
      throw new Error('Missing IMAGE_GEN_GEMINI_API_KEY environment variable.');
    }
    return apiKey;
  };

  let apiKey = fields.IMAGE_GEN_GEMINI_API_KEY ?? getApiKey();

  logger.info('[GeminiImageTools] Initializing Gemini image generation tool');

  /**
   * Image Generation Tool
   */
  const imageGenTool = tool(
    async ({ prompt, n = 1 }, runnableConfig) => {
      logger.info('[GeminiImageGen] Generating image');
      logger.info('[GeminiImageGen] Prompt: ' + prompt);
      logger.info('[GeminiImageGen] Number of images: ' + n);

      if (!prompt) {
        throw new Error('Missing required field: prompt');
      }

      if (!apiKey) {
        return returnValue(
          'Missing IMAGE_GEN_GEMINI_API_KEY. Please configure the API key to use Gemini image generation.',
        );
      }

      /** @type {AbortSignal} */
      let derivedSignal = null;
      /** @type {() => void} */
      let abortHandler = null;

      try {
        if (runnableConfig?.signal) {
          derivedSignal = AbortSignal.any([runnableConfig.signal]);
          abortHandler = createAbortHandler();
          derivedSignal.addEventListener('abort', abortHandler, { once: true });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: replaceUnwantedChars(prompt) }] }],
        });

        const response = result.response;

        if (!response || !response.candidates || response.candidates.length === 0) {
          return returnValue(
            'No image data returned from Gemini API. There may be a problem with the API or your configuration.',
          );
        }

        // Extract the first image from the response
        const candidate = response.candidates[0];
        const parts = candidate.content?.parts || [];

        let base64Image = null;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }

        if (!base64Image) {
          return returnValue(
            'No image data found in Gemini API response. The model may have returned text instead of an image.',
          );
        }

        // Gemini returns images as PNG by default
        const content = [
          {
            type: ContentTypes.IMAGE_URL,
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
        ];

        const file_ids = [v4()];
        const textResponse = [
          {
            type: ContentTypes.TEXT,
            text: displayMessage + `\n\ngenerated_image_id: "${file_ids[0]}"`,
          },
        ];

        return [textResponse, { content, file_ids }];
      } catch (error) {
        const message = '[GeminiImageGen] Problem generating the image:';
        logAxiosError({ error, message });
        return returnValue(`Something went wrong when trying to generate the image. The Gemini API may be unavailable:
Error Message: ${error.message}`);
      } finally {
        if (abortHandler && derivedSignal) {
          derivedSignal.removeEventListener('abort', abortHandler);
        }
      }
    },
    {
      name: 'gemini_image_gen',
      description:
        'Generate images using Google Gemini 2.5 Flash Image model. Provide a detailed text prompt describing the image you want to create. The model excels at creating high-quality, photorealistic images from text descriptions.',
      schema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description:
              'A detailed text description of the image to generate. Be specific about subjects, style, composition, lighting, and other visual elements.',
          },
          n: {
            type: 'number',
            description: 'Number of images to generate (currently only supports 1)',
            default: 1,
          },
        },
        required: ['prompt'],
      },
    },
  );

  return [imageGenTool];
}

module.exports = createGeminiImageTools;
