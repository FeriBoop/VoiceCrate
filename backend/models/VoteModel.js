var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var VoteSchema = new Schema({
	'type' : {type: Number, enum: [1, -1]},
	'userId' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'users'
	},
	'postId' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'posts'
	}
});

module.exports = mongoose.model('vote', VoteSchema);
