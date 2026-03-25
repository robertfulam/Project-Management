const express = require('express');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  updateSubmission,
  uploadFile,
} = require('../controllers/submissionController');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/wav', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and PDF files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// All submission routes are protected
router.use(protect);

// File upload endpoint
router.post('/upload', upload.single('file'), uploadFile);

// Submission CRUD
router.post('/', createSubmission);
router.get('/user', getUserSubmissions);
router.get('/:id', getSubmissionById);
router.put('/:id', updateSubmission);

module.exports = router;