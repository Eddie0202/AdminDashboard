const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth_controller");

router.get('/login', authController.index);

router.get('/logout', authController.logout);

router.get('/', authController.index);

router.post('/login', authController.loginSubmit);

module.exports = router;

