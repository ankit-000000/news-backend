const express = require('express');
const router = express.Router();
const { updateRole, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.patch('/:id/role', auth, checkRole(['ADMIN']), updateRole);
router.patch('/profile', auth, updateProfile);

module.exports = router; 