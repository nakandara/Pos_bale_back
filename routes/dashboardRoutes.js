const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/dashboardController');

router.get('/', getDashboardAnalytics);

module.exports = router;

