const express = require('express');
const router = express.Router();
const articleStatusController = require('../controllers/articleStatusController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Editor routes
router.patch(
  '/editor/:id/status',
  auth,
  checkRole(['EDITOR']),
  articleStatusController.updateStatusByEditor
);

// Admin routes
router.patch(
  '/admin/:id/status',
  auth,
  checkRole(['ADMIN']),
  articleStatusController.updateStatusByAdmin
);

router.get(
  '/pending',
  auth,
  checkRole(['ADMIN']),
  articleStatusController.getPendingArticles
);

router.get(
  '/status',
  auth,
  checkRole(['ADMIN']),
  articleStatusController.getArticlesByStatus
);

router.get(
  '/my',
  auth,
  checkRole(['EDITOR', 'ADMIN']),
  articleStatusController.getMyArticlesByStatus
);

router.get(
  '/all',
  auth,
  checkRole(['ADMIN']),
  articleStatusController.getAllArticlesByStatus
);

module.exports = router; 