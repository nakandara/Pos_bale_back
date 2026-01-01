const express = require('express');
const router = express.Router();
const {
  getShopClosures,
  getShopClosureById,
  createShopClosure,
  updateShopClosure,
  deleteShopClosure,
  getShopClosureStats
} = require('../controllers/shopClosureController');

// Stats route must come before :id route
router.get('/stats', getShopClosureStats);

router.route('/')
  .get(getShopClosures)
  .post(createShopClosure);

router.route('/:id')
  .get(getShopClosureById)
  .put(updateShopClosure)
  .delete(deleteShopClosure);

module.exports = router;

