var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');

/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

module.exports = {
  list: function (req, res) {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided
    const skip = (page - 1) * limit; // Calculate skip based on page and limit
  
    PostModel.find()
      .skip(skip) // Skip posts for the previous pages
      .limit(Number(limit)) // Limit the number of posts per page
      .populate('userId', 'username') // Populate username from User model
      .exec(function (err, posts) {
        if (err) {
          return res.status(500).json({
            message: 'Error when getting posts.',
            error: err,
          });
        }
  
        // Get the total count of posts for pagination calculation
        PostModel.countDocuments().exec(function (err, count) {
          if (err) {
            return res.status(500).json({
              message: 'Error when counting posts.',
              error: err,
            });
          }
  
          return res.json({
            posts, // Return the posts for the current page
            totalPosts: count, // Return the total number of posts for pagination
          });
        });
      });
  },  

  // Posodobljena metoda za prikaz posamezne objave
  show: function (req, res) {
    var id = req.params.id;

    PostModel.findOne({ _id: id })
      .populate('userId', 'username') // Populacija za prikaz avtorja
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username' }, // Populacija uporabnikov v komentarjih
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

    PostModel.findOne({ _id: id }, function (err, post) {
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

  remove: function (req, res) {
    var id = req.params.id;

    PostModel.findByIdAndRemove(id, function (err, Post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the Post.',
          error: err,
        });
      }

      return res.status(204).json();
    });
  },

  addComment: async function (req, res) {
    const postId = req.params.id;

    // Preveri, ali so potrebni podatki prisotni
    if (!req.body.content || !req.body.userId) {
      return res.status(400).json({
        message: 'Content and userId are required',
      });
    }

    try {
      const newComment = new CommentModel({
        content: req.body.content,
        userId: req.body.userId,
      });

      const comment = await newComment.save();
      console.log('Saved Comment:', comment);

      // Dodaj komentar v objavo
      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } },
        { new: true }
      )
        .populate('comments')
        .exec();

      // console.log('Updated Post with New Comment:', post);
      return res.status(201).json(post);
    } catch (err) {
      console.log('Error:', err.message || err);
      return res.status(500).json({
        message: 'Error when creating comment or updating post',
        error: err.message || err,
      });
    }
  },

  removeComment: async function (req, res) {
    const postId = req.params.id;
    const commentId = req.params.commentId;

    try {
      const comment = await CommentModel.findByIdAndRemove(commentId);

      if (!comment) {
        return res.status(404).json({
          message: 'No such comment',
        });
      }

      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true }
      )
        .populate('comments')
        .exec();

      return res.status(204).json(post);
    } catch (err) {
      console.log('Error:', err.message || err);
      return res.status(500).json({
        message: 'Error when deleting comment or updating post',
        error: err.message || err,
      });
    }
  },
};
