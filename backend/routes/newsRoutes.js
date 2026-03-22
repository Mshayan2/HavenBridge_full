import express from 'express';
import { getFeed } from '../controllers/newsController.js';

const router = express.Router();

// GET /api/news/feed
router.get('/feed', getFeed);

export default router;
