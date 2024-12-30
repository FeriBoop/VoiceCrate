var express = require('express');
var router = express.Router();
var VoteController = require('../controllers/VoteController.js');

/*
 * GET
 */
router.get('/', VoteController.list)

/*
 * POST
 */
router.post('/', VoteController.create);

/*
 * PUT
 */
router.put('/:id', VoteController.update);

/*
 * DELETE
 */
router.delete('/:id', VoteController.remove);

module.exports = router;
