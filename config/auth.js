'use strict';

module.exports = {
	'twitterAuth': {
		'clientID': process.env.TWITTER_ID,
		'clientSecret': process.env.TWITTER_SECRET,
		'callbackURL': 'http://127.0.0.1:5000/auth/twitter/callback'
	}
};
