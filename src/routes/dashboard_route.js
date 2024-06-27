const express = require('express');
const router = express.Router();
const dashboardController = require("../controllers/dashboard_controller");

// Route GET /
router.get('/', dashboardController.index);

module.exports = router;
