var VoteModel = require('../models/VoteModel.js');
let PostModel = require('../models/PostModel.js');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

/**
 * VoteController.js
 *
 * @description :: Server-side logic for managing Votes.
 */
module.exports = {
    /**
     * VoteController.list()
     */
    list: function (req, res) {

        let filter = {};
        if (req.query.postId) filter.postId = ObjectId(req.query.postId);
        if (req.query.userId) filter.userId = ObjectId(req.query.userId);

        // Maybe add user data populate here.
        VoteModel.find(filter, function (err, Votes) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Vote.',
                    error: err
                });
            }

            return res.json(Votes);
        });
    },

    /**
     * VoteController.create()
     */
    create: async function (req, res) {
        let session = await mongoose.startSession();

        if (!req.body.userId) return res.status(500).json({message: "User not specified"});
        if (!req.body.postId) return res.status(500).json({message: "Post not specified"});

        await session.withTransaction(async () => {
            // check if vote exists
            let check = await VoteModel.findOne({postId: req.body.postId, userId: req.body.userId}).exec();
            if (check) throw new Error("Vote already exists");

            let post = await PostModel.findById(req.body.postId).exec();
            if (!post) throw new Error("Post does not exist");

            let val = req.body.type;
            post.score += val;

            await post.save();

            return VoteModel.create({
                type: val,
                userId: req.body.userId,
                postId: req.body.postId
            }).then(vote => {
                res.status(200).json({
                    newScore: post.score,
                    vote: vote
                })
            });
        }).catch(err => {
            res.status(500).json({
                message: "There was an error posting vote!",
                err: err
            })
        })

        session.endSession();
    },

    /**
     * VoteController.update()
     */
    update: async function (req, res) {
        let id = ObjectId(req.params.id);

        let session = await mongoose.startSession()

        await session.withTransaction(async () => {
            let vote = await VoteModel.findById(id).exec();
            if (!vote) throw new Error("Vote does not exist");

            let post = await PostModel.findById(ObjectId(vote.postId)).exec();
            if (!post) throw new Error("Post does not exist");

            let nVal = req.body.type;
            let oVal = vote.type;

            post.score += nVal - oVal;

            await post.save();

            vote.type = nVal;
            return vote.save().then(vote => {
                res.status(200).json({
                    newScore: post.score,
                    vote: vote
                })
            });
        }).catch(err => {
            res.status(500).json({
                message: "Error updating vote",
                err: err
            })
        })

        session.endSession();
    },

    /**
     * VoteController.remove()
     */
    remove: async function (req, res) {
        let id = ObjectId(req.params.id);

        let session = await mongoose.startSession()

        await session.withTransaction(async () => {
            let vote = await VoteModel.findById(id).exec();
            if (!vote) throw new Error("Vote does not exist");

            let post = await PostModel.findById(vote.postId).exec();
            if (!post) throw new Error("Post does not exist");

            let oVal = vote.type;
            post.score -= oVal;
            await post.save();

            return VoteModel.findByIdAndDelete(id, {useFindAndModify: false}).then(() => {
                res.status(200).json({newScore: post.score, vote: null})
            });
        }).catch(err => {
            res.status(500).json({
                message: "Error updating vote",
                err: err
            })
        })

        session.endSession();
    }
};
