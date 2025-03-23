const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Public routes
router.get('/trending', articleController.getTrendingArticles);
router.get('/category/:categoryId', articleController.getArticlesByCategory);
router.get('/:id', articleController.viewArticle);

// Authenticated routes
router.use(auth);
router.get('/feed/my', articleController.getMyFeed);
router.post('/:id/like', articleController.likeArticle);
router.delete('/:id/like', articleController.unlikeArticle);

// Editor/Admin routes
router.post('/', checkRole(['EDITOR', 'ADMIN']), articleController.createArticle);
router.put('/:id', checkRole(['EDITOR', 'ADMIN']), articleController.updateArticle);

module.exports = router; 