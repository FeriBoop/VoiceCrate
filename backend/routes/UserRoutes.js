var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController.js');

/*
 * GET
 */
router.get('/', UserController.list);

/*
 * GET
 */

router.get('/:id', UserController.show);
/*

 * POST
 */
router.post('/', UserController.create);

router.post('/login', UserController.login);

/*
 * PUT
 */
router.put('/:id', UserController.update);

/*
 * DELETE
 */
router.delete('/:id', UserController.remove);

/*
 * PATCH 
 */
router.patch('/toggle-ban/:id', UserController.toggleBanStatus);

module.exports = router;