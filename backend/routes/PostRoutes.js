const express = require('express');
const { upload } = require('../controllers/PostController.js'); // Import only upload
const PostController = require('../controllers/PostController.js'); // Import other methods


const router = express.Router();


function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.get('/', PostController.list);

router.get('/:id', PostController.show);

router.post('/', PostController.upload.array('newImages', 10), PostController.create);
router.put('/:id', PostController.upload.array('newImages', 10), PostController.update);


router.delete('/:id', PostController.remove);

module.exports = router;