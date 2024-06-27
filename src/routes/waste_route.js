const express = require('express');
const router = express.Router();
const wasteController = require("../controllers/waste_controller");
router.get('/', wasteController.getFeedbackWaste);
router.get('/feedback', wasteController.getFeedbackWaste);
router.get('/classified', wasteController.getTest);
module.exports = router;