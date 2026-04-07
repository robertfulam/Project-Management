const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { aiChat, getChatHistory, summarizeTask, monetizeTask, analyzeFile } = require('../controllers/aiController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);

router.post('/chat', aiChat);
router.get('/chats', getChatHistory);
router.post('/summarize/:taskId', summarizeTask);
router.post('/monetize/:taskId', monetizeTask);
router.post('/analyze-file', upload.single('file'), analyzeFile);

module.exports = router;