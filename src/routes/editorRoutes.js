const express = require('express');
const router = express.Router();
const editorController = require('../controllers/editorController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// All routes require editor or admin role
router.use(auth, checkRole(['EDITOR', 'ADMIN']));

router.get('/stats', editorController.getEditorStats);
router.get('/articles', editorController.getEditorArticles);
router.get('/articles/top', editorController.getTopArticles);
router.get('/articles/:id', editorController.getArticleDetails);
router.patch('/articles/:id/status', editorController.updateArticleStatus);

module.exports = router; 