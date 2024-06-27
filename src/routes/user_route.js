const express = require('express');
const router = express.Router();
const userController = require("../controllers/user_controller");
router.get('/', userController.getAllUsers);
router.get('/person', userController.getPersonUsers);
router.get('/collector', userController.getCollectorUser);
router.post('/person', userController.getCollectorUser);
router.post('/person/:id/banned', userController.unbanPerson);
router.post('/person/:id/active', userController.banPerson);
router.post('/collector/:id/banned', userController.unbanCollector);
router.post('/collector/:id/active', userController.banCollector);
module.exports = router;

