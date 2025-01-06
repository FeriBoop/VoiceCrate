var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  images: [
    {
      dateCreated: Date,
      imageName: String,
      imageUrl: String,
    }
  ],
  score: { type: Number, required: true, default: 0 },
  commentsCount: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('posts', PostSchema);
