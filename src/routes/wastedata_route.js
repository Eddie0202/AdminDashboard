const express = require('express');
const router = express.Router();
const wasteDataController = require("../controllers/wastedata_controller");
router.get('/', wasteDataController.index)
module.exports = router;

