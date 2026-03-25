const express = require('express');
const { protect } = require('../middleware/auth');
const { aiChat, getChatHistory, assessSubmission } = require('../controllers/aiController');

const router = express.Router();

// All AI routes are protected
router.use(protect);

// AI chat endpoints
router.post('/chat', aiChat);
router.get('/chats', getChatHistory);

// AI submission assessment
router.post('/assess/:submissionId', assessSubmission);

module.exports = router;