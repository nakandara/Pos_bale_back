const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getWeeklySales,
  getDayOfWeekSales,
  getDailySales
} = require('../controllers/saleController');

// Analytics routes (must come before /:id route)
router.get('/analytics/weekly', getWeeklySales);
router.get('/analytics/day-of-week', getDayOfWeekSales);
router.get('/analytics/daily', getDailySales);

router.route('/')
  .get(getSales)
  .post(createSale);

router.route('/:id')
  .get(getSaleById)
  .put(updateSale)
  .delete(deleteSale);

module.exports = router;


