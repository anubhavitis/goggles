// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import multer from 'multer';
import { AIController } from '../controller/aiController.js';

const router = Router();
const aiController = new AIController();

// Configure multer for memory storage (no files saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Routes
router.get('/health', aiController.healthCheck);
router.post('/generate-filename', upload.single('image'), aiController.generateFilename);

export default router;
