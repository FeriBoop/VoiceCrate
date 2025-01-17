var express = require('express');
var router = express.Router();
var commentController = require('../controllers/CommentController');

router.get('/', commentController.list);

router.post('/', commentController.create);

router.put('/:id', commentController.update);

router.delete('/:id', commentController.remove);

module.exports = router;