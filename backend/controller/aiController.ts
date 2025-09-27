import { Request, Response } from 'express';
import { AIService } from '../services/ai.js';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService({
      apiKey: process.env.OPENAI_API_KEY || '',
      prompt: `Analyze the attached image and generate a short, descriptive filename that clearly reflects its subject, context, and content.
Rules:
    1. Use lowercase letters only. Separate words with hyphens. No spaces or underscores.
    2. Keep the filename between 3 to 8 words. Be concise but meaningful.
    3. Apply intelligent context recognition:
        - If it is an album cover, include the album title and band or artist name.
        - If it is artwork, mention the style (e.g., oil-painting, digital-art, 3d-render).
        - If it's a poster, include the movie/show/event name.
    4. Avoid generic terms like "image", "picture", "photo", or "screenshot".
    5. Do not include the file extension (e.g., .jpg or .png) in the output.

Return only the final filename string, with no extra explanation or punctuation.`,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    });
  }

  /**
   * Generate filename from uploaded image
   * POST /api/generate-filename
   */
  public generateFilename = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if image file was uploaded
      if (!req.file) {
        res.status(400).json({
          error: 'No image file provided. Please upload an image file.',
          details: 'Expected a file field named "image"'
        });
        return;
      }

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        res.status(500).json({
          error: 'OpenAI API key not configured',
          details: 'Please set the OPENAI_API_KEY environment variable'
        });
        return;
      }

      console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

      // Generate filename using AI Service
      const generatedFilename = await this.aiService.getName(req.file);

      res.json({
        success: true,
        originalFilename: req.file.originalname,
        generatedFilename: generatedFilename,
        imageSize: req.file.size,
        mimeType: req.file.mimetype
      });

    } catch (error) {
      console.error('Error generating filename:', error);
      
      res.status(500).json({
        error: 'Failed to generate filename',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  /**
   * Health check endpoint
   * GET /health
   */
  public healthCheck = (req: Request, res: Response): void => {
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  };
}
