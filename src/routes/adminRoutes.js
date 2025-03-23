const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserDetails, 
  updateUser, 
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// All routes require admin role
router.use(auth, checkRole(['ADMIN']));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router; 