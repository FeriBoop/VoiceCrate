var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');
const mongoose = require("mongoose");

const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Function to configure multer
const createUploader = () => {
    console.log("erewre");
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.join(__dirname, '..', 'public', 'images');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, {recursive: true});
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                //cb(null, `${Date.now()}-${file.originalname}`);
                cb(null, `${file.originalname}`);
            },
        }),
    });
};
const upload = createUploader(); // Create a reusable multer instance


/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

module.exports = {
    upload,
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
        var scoreOnly = !!req.query.scoreOnly && req.query.scoreOnly === "true";

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
                if (scoreOnly) {
                    return res.status(200).json({score: post.score})
                } else return res.json(post);
            });
    },

    create: async function (req, res) {
        try {
            // Handle file uploads
            const uploadedFiles = req.files || [];
            const images = uploadedFiles.map((file) => ({
                imageName: file.originalname,
                imageUrl: `/images/${file.filename}`,
            }));

            const newPost = new PostModel({
                title: req.body.title,
                content: req.body.content,
                category: req.body.category,
                userId: req.body.userId,
                images,
            });

            const savedPost = await newPost.save();
            return res.status(201).json(savedPost);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when creating Post',
                error: err,
            });
        }
    },

    update: async function (req, res) {
        const id = req.params.id;
        try {
            const post = await PostModel.findOne({_id: id});
            if (!post) {
                return res.status(404).json({message: 'No such post'});
            }

            // Update fields
            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;
            post.category = req.body.category || post.category;

            // Handle uploaded images
            const uploadedFiles = req.files || [];
            const newImages = uploadedFiles.map((file) => ({
                imageName: file.originalname,
                imageUrl: `/images/${file.filename}`,
            }));

            // Parse existingImages from JSON string
            let existingImages = [];
            if (req.body.existingImages) {
                try {
                    existingImages = JSON.parse(req.body.existingImages);
                    if (!Array.isArray(existingImages)) {
                        throw new Error('Parsed existingImages is not an array');
                    }
                } catch (e) {
                    console.error('Error parsing existingImages:', e);
                    return res.status(400).json({message: 'Invalid existingImages format'});
                }
            }

            // Determine images to delete
            const imagesToDelete = post.images.filter(
                (image) => !existingImages.some((existing) => existing.imageUrl === image.imageUrl)
            );

            // Delete files from the filesystem
            imagesToDelete.forEach((image) => {
                const imagePath = path.join(__dirname, '..', 'public', image.imageUrl);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`Error deleting image: ${imagePath}`, err);
                    } else {
                        console.log(`Deleted image: ${imagePath}`);
                    }
                });
            });

            // Combine new and existing images
            post.images = [...existingImages, ...newImages];

            // Save updated post
            const updatedPost = await post.save();
            return res.json(updatedPost);
        } catch (err) {
            console.error('Error during update:', err); // Log detailed error
            return res.status(500).json({
                message: 'Error when updating post.',
                error: err.message || err,
            });
        }
    },

    remove: async function (req, res) {
        var id = req.params.id;

        let session = await mongoose.startSession();

        await session.withTransaction(async () => {
            let cDelRes = await CommentModel.deleteMany({postId: mongoose.Types.ObjectId(id)});
            if (!cDelRes.ok) {
                console.log("error deleting comments");
                res.status(500).json({
                    message: 'Error deleting comments'
                })
            }

            let post = await PostModel.findById(id)
            if (!post) {
                throw new Error("Post not found")
            }

            // Delete the images from the public/images directory
            if (post.images && post.images.length > 0) {
                post.images.forEach((image) => {
                    const imagePath = path.join(__dirname, '..', 'public', 'images', image.imageName);

                    // Check if file exists and then delete it
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error(`Error deleting image ${image.imageName}:`, err);
                        } else {
                            console.log(`Image ${image.imageName} deleted successfully.`);
                        }
                    });
                });
            }

            await PostModel.findByIdAndRemove(id, {useFindAndModify: false, session: session}, function (err) {
                if (!err) return;
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
