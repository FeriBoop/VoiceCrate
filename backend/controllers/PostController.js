var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');
const mongoose = require("mongoose");



module.exports = {
    /**
     * Posts GET query params: <br>
     * sortBy - field by which the posts are sorted: <br>
     *      'date' - sort by createdAt (default)
     *      'name' - sort by title
     *      'score' - sort by score
     *      'commentsNum' - sort by commentsNumber
     * ord - sort order: <br>
     *      'asc' - ascending
     *      'desc' - descending (default) <br>
     * page - page number, 1 based, default 1
     * limit - number of results per page, default 10
     */
    list: function (req, res) {
        let sortOrder = 'desc';
        let sortField = 'createdAt'
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page
        const skip = (page - 1) * limit; // Calculate the number of posts to skip

        // ord parameter check

        {
            let o = req.query['ord'];
            if (o) {
                if (o !== 'asc' && o !== 'desc') {
                    res.status(500).json({
                        message: 'Invalid GET query parameter: \'ord\' = ' + o
                    });
                    return;
                }

                sortOrder = o;
            }
        }
        // orderBy parameter check

        {
            let s = req.query['sortBy'];
            if (s) {
                switch (s) {
                    case 'name':
                        sortField = 'title';
                        break;
                    case 'score':
                        sortField = 'score';
                        break;
                    case 'commentsNum':
                        sortField = 'commentsNumber';
                        break;
                    case 'date':
                        sortField = 'createdAt';
                        break;

                    default:
                        req.status(500).json({
                            message: "Invalid GET query parameter: \'sortBy\' = " + s
                        })
                        return;
                }
            }
        }
        let sortStr = (sortOrder === 'desc' ? '-' : '') + sortField;
        let query = PostModel.find().sort(sortStr);

        query.populate('userId', 'username') // Dodano za pridobitev username polja iz User modela
            .skip(skip)
            .limit(limit)
            .exec(function (err, posts) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Post.',
                        error: err,
                    });
                }

                PostModel.countDocuments({}, function (err, count) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error counting posts.',
                            error: err,
                        });
                    }

                    return res.json({
                        posts: posts,
                        totalPosts: count, // Total number of posts
                        totalPages: Math.ceil(count / limit), // Total pages
                        currentPage: page, // Current page number
                        postsPerPage: limit, // Number of posts per page
                    });
                });
            });
    },

    // Posodobljena metoda za prikaz posamezne objave
    show: function (req, res) {
        var id = req.params.id;

        PostModel.findOne({_id: id})
            .populate('userId', 'username') // Populacija za prikaz avtorja
            .populate({
                path: 'comments',
                populate: {path: 'userId', select: 'username'}, // Populacija uporabnikov v komentarjih
            })
            .exec(function (err, post) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Post.',
                        error: err,
                    });
                }

                if (!post) {
                    return res.status(404).json({
                        message: 'No such Post',
                    });
                }

                return res.json(post);
            });
    },

    create: function (req, res) {
        var newPost = new PostModel({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            userId: req.body.userId,
        });

        newPost.save(function (err, Post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Post',
                    error: err,
                });
            }
            return res.status(201).json(Post);
        });
    },

    update: function (req, res) {
        var id = req.params.id;

        PostModel.findOne({_id: id}, function (err, post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting post',
                    error: err,
                });
            }

            if (!post) {
                return res.status(404).json({
                    message: 'No such post',
                });
            }

            post.title = req.body.title ? req.body.title : post.title;
            post.content = req.body.content ? req.body.content : post.content;
            post.category = req.body.category ? req.body.category : post.category;

            post.save(function (err, post) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating post.',
                        error: err,
                    });
                }

                return res.json(post);
            });
        });
    },

    remove: async function (req, res) {
        var id = req.params.id;

        let session = await mongoose.startSession();

        await session.withTransaction(async () => {
            let cDelRes = await CommentModel.deleteMany({postId: mongoose.Types.ObjectId(id)});
            if(!cDelRes.ok){
                console.log("error deleting comments");
                res.status(500).json({
                    message: 'Error deleting comments'
                })
            }

            await PostModel.findByIdAndRemove(id, {useFindAndModify: false, session: session}, function (err) {
                if(!err) return;
                console.log(err);
                throw err;
            });

            res.status(200).json({})
        }).catch((err) => {
            return res.status(500).json({
                message: 'Error when deleting the Post.',
                error: err,
            });
        })

        session.endSession();
    },


};
