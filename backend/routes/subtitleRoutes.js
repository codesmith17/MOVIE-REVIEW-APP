const express = require('express');
const router = express.Router();
const subtitleController = require('../controllers/subtitleController');

// Search subtitles
router.get('/search', subtitleController.searchSubtitles);

// Download subtitle
router.get('/download', subtitleController.downloadSubtitle);

module.exports = router; 