import OpenAI from 'openai';
import { OCR_EXTRACTION_PROMPT } from './prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractTextFromImage(
  base64Data: string,
  mimeType: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
          {
            type: 'text',
            text: OCR_EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content ?? '';
}
