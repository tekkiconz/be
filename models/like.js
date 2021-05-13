const mongoose = require('mongoose')

const LikeSchema = new mongoose.Schema(
	{
		userid: { type: String, required: true, unique: true },
		bookid: { type: String, required: true, unique: true }        
	},
	{ collection: 'likes' }
)

const likeModel = mongoose.model('LikeSchema', LikeSchema)

module.exports = likeModel