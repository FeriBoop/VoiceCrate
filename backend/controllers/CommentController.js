var CommentModel = require('../models/CommentModel');
var PostModel = require('../models/PostModel');
var UserModel = require('../models/UserModel');
var mongoose = require('mongoose');

module.exports = {
    list: function (req, res) {

        CommentModel.find({postId: mongoose.Types.ObjectId(req.body.postId)})
            .populate('user', 'displayName').exec(function (err, comments) {
            if (err) {
                return res.status(500).json({
                    message: "Error fetching comments.",
                    err: err
                })
            }
            return res.json(comments);
        })
    },

    create: async function (req, res) {
        new CommentModel({
            content: req.body.content,
            userId: req.body.userId,
            postId: req.body.postId,
            createdAt: Date.now(),
        });

        let session = await mongoose.startSession();

        await session.withTransaction(async () => {
            if (!await UserModel.exists({_id: req.body.userId})) throw new Error("Comment author does not exist");

            let post = await PostModel.findById(req.body.postId).exec();
            if (!post) throw new Error("Comment post does not exist");
            post.commentsCount++;
            await post.save();
            return CommentModel.create({
                content: req.body.content,
                userId: req.body.userId,
                postId: req.body.postId,
            }).then(com => res.status(200).json(com))

        }).catch(
            (err) => {
                res.status(500).json({
                    message: "Failed to post comment",
                    err: err
                })
            })
        session.endSession()
    },

    update: async function (req, res) {
        let comment = await CommentModel.findById(req.params._id);
        if (!comment) {
            res.status(500).json({
                message: "Comment does not exist"
            })
            return;
        }

        comment.content = req.body.content;
        comment.updatedAt = Date.now();

        return comment.save(function (err, comment) {
            if (err) {
                res.status(500).json({
                    message: "Error when updating comment.",
                    err: err
                });
                return;
            }

            res.status(200).json(comment);
        });
    },

    remove: async function (req, res) {
        let id = req.params.id;
        let session = await mongoose.startSession();

        await session.withTransaction(async () => {
            let comment = await CommentModel.findById(id).exec();
            if (!comment) throw new Error("Comment does not exist");

            let post = await PostModel.findById(comment.postId).exec();
            if (!post) throw new Error("Comment post does not exist");
            post.commentsCount--;
            await post.save();

            return CommentModel.findByIdAndRemove(id, {useFindAndModify: false}).then(com => res.status(200).json({}))
        }).catch((err) => {
            res.status(500).json({
                message: "Error deleting comment!",
                err: err
            })
        })

        await session.endSession();
    }
}