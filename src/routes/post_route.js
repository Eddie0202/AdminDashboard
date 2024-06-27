const express = require('express');
const router = express.Router();
const postController = require("../controllers/post_controller");
router.get('/', postController.index);
router.get('/add', postController.createIndex);
router.post('/add', postController.create);
router.get('/update/:id', postController.getById);
router.post('/update/:id', postController.update);
router.delete('/:id', postController.delete);
module.exports = router;

