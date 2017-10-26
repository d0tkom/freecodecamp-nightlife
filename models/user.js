var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	twitter: {
		id: String,
		displayName: String,
		username: String,
		email: String
	}
});

module.exports = mongoose.model('User', userSchema);
