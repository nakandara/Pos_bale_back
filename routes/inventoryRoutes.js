const express = require('express');
const router = express.Router();
const {
  getInventory,
  getCategoryInventory
} = require('../controllers/inventoryController');

router.get('/', getInventory);
router.get('/:categoryId', getCategoryInventory);

module.exports = router;


