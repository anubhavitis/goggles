import OpenAI from 'openai';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface OpenAIConfig {
  apiKey: string;
  prompt: string;
  model: string;
}

export class AIService {
  private openai: OpenAI;
  private prompt: string;
  private model: string;

  constructor(config: OpenAIConfig) {
    // Validate API key
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('OpenAI API key is required');
    }
    
    if (!config.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. API key should start with "sk-"');
    }
    
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
    this.prompt = config.prompt;
    this.model = config.model;
  }

  public async getName(imageFile: MulterFile): Promise<string> {
    
    // MulterFile already has a buffer, so we can directly convert to base64
    const encodedImage = imageFile.buffer.toString('base64');

    
    // Create the chat completion request
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are a filename generation bot. You must return only a filename based on the attached image. No explanations. No descriptions. No punctuation. No quotes. No code blocks. Just a lowercase hyphenated filename of 3 to 8 words in plain text."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: this.prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.mimetype};base64,${encodedImage}`,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_completion_tokens: 50
    });

    // Extract the generated filename
    console.log(`prompt: ${this.prompt}`);
    console.log(`model: ${this.model}`);
    console.log(`Generated filename: ${JSON.stringify(completion)}`);
    const generatedFilename = completion.choices[0]?.message?.content?.trim() || 'unknown-name';
    return generatedFilename;
  }

}
