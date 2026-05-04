const OpenAI = require('openai');
import config from '../../../config';

interface TranslationResult {
  transliteration: string;
  translation: string;
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: config.openai.api_key,
});

export const getTranslation = async (title: string): Promise<TranslationResult> => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
                    You are a translation assistant.

                    Your job:
                    - Convert the chant title into English
                    - Provide both transliteration and translation

                    IMPORTANT:
                    - Always return ONLY valid JSON
                    - Do NOT add extra text

                    Format:
                    {
                      "transliteration": string,
                      "translation": string
                    }

                    Example:
                    Input: "আমি তোমাকে ভালোবাসি" 

                    Output:
                    {
                      "transliteration": "Ami tomake bhalobasi",
                      "translation": "I love you"
                    }
          `,
        },
        {
          role: 'user',
          content: `Text: "${title}"`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) throw new Error('No response from OpenAI');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      transliteration: parsed.transliteration || '',
      translation: parsed.translation || '',
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

